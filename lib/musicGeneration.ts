// Orquestrador de geração de música via Suno AI
// Gerencia o fluxo: disparo → polling via QStash → conclusão → notificação

import { getOrder, updateOrder, saveAccessCodeIndex } from './orderStore';
import { submitGeneration, checkStatus } from './sunoClient';
import { getSunoStylePrompt, generateSongTitle } from './musicStyles';
import { scheduleStatusPoll } from './qstash';

export interface SunoTask {
  taskId: string;
  style: string;
  styleLabel: string;
  status: 'submitted' | 'processing' | 'completed' | 'failed';
  audioUrls: string[];
  submittedAt: string;
  completedAt?: string;
  error?: string;
}

// Gerar código de acesso aleatório (CANTOS-XXXX)
function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CANTOS-${code}`;
}

// 1. Iniciar geração de música (chamado pelo webhook PIX)
export async function startMusicGeneration(orderId: string): Promise<void> {
  console.log(`[MUSIC-GEN] Iniciando geração para pedido: ${orderId}`);

  const order = await getOrder(orderId);
  if (!order) {
    throw new Error(`[MUSIC-GEN] Pedido não encontrado: ${orderId}`);
  }

  // Já está em geração ou completo? Ignorar
  if (order.musicStatus === 'generating' || order.musicStatus === 'completed') {
    console.log(`[MUSIC-GEN] Pedido já em ${order.musicStatus}, ignorando`);
    return;
  }

  const lyrics = order.generatedLyrics || order.approvedLyrics || '';
  if (!lyrics) {
    throw new Error(`[MUSIC-GEN] Pedido sem letra: ${orderId}`);
  }

  const honoreeName = order.honoreeName || 'Alguém Especial';
  const occasion = order.occasion || 'outro';
  const sunoTasks: SunoTask[] = [];

  try {
    // Básico: 1 geração (1 estilo) → 2 variações
    const style1 = order.musicStyle || 'pop';
    const style1Label = order.musicStyleLabel || style1;
    const sunoStyle1 = getSunoStylePrompt(style1);
    const title1 = generateSongTitle(honoreeName, occasion);

    console.log(`[MUSIC-GEN] Estilo 1: ${style1Label} → "${sunoStyle1}"`);

    const taskIds1 = await submitGeneration({
      title: title1,
      lyrics: lyrics,
      style: sunoStyle1,
    });

    sunoTasks.push({
      taskId: taskIds1[0],
      style: style1,
      styleLabel: style1Label,
      status: 'submitted',
      audioUrls: [],
      submittedAt: new Date().toISOString(),
    });

    if (taskIds1.length > 1) {
      sunoTasks.push({
        taskId: taskIds1[1],
        style: style1,
        styleLabel: style1Label,
        status: 'submitted',
        audioUrls: [],
        submittedAt: new Date().toISOString(),
      });
    }

    // Premium: 2ª geração (2º estilo) → mais 2 variações
    if (order.plan === 'premium' && order.musicStyle2) {
      const style2 = order.musicStyle2;
      const style2Label = order.musicStyle2Label || style2;
      const sunoStyle2 = getSunoStylePrompt(style2);
      const title2 = `${honoreeName} - ${style2Label}`;

      console.log(`[MUSIC-GEN] Estilo 2 (Premium): ${style2Label} → "${sunoStyle2}"`);

      const taskIds2 = await submitGeneration({
        title: title2,
        lyrics: lyrics,
        style: sunoStyle2,
      });

      sunoTasks.push({
        taskId: taskIds2[0],
        style: style2,
        styleLabel: style2Label,
        status: 'submitted',
        audioUrls: [],
        submittedAt: new Date().toISOString(),
      });

      if (taskIds2.length > 1) {
        sunoTasks.push({
          taskId: taskIds2[1],
          style: style2,
          styleLabel: style2Label,
          status: 'submitted',
          audioUrls: [],
          submittedAt: new Date().toISOString(),
        });
      }
    }

    // Gerar código de acesso
    const accessCode = generateAccessCode();

    // Salvar status no Redis
    await updateOrder(orderId, {
      musicStatus: 'generating',
      sunoTasks: JSON.stringify(sunoTasks),
      musicStartedAt: new Date().toISOString(),
      musicRetryCount: '0',
      accessCode,
    });

    // Salvar índice reverso código → orderId (para página /acesso)
    await saveAccessCodeIndex(accessCode, orderId);

    // Agendar primeiro polling em 15 segundos (dar tempo do Suno começar)
    await scheduleStatusPoll(orderId, 15);

    console.log(`[MUSIC-GEN] Geração iniciada com sucesso! ${sunoTasks.length} tasks criadas`);

  } catch (error) {
    console.error(`[MUSIC-GEN] Erro ao iniciar geração:`, error);

    await updateOrder(orderId, {
      musicStatus: 'failed',
      musicError: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    throw error;
  }
}

// 2. Verificar status (chamado pelo QStash a cada 10s)
export async function pollMusicStatus(orderId: string): Promise<'completed' | 'processing' | 'failed'> {
  console.log(`[MUSIC-POLL] Verificando status: ${orderId}`);

  const order = await getOrder(orderId);
  if (!order) {
    console.error(`[MUSIC-POLL] Pedido não encontrado: ${orderId}`);
    return 'failed';
  }

  const sunoTasks: SunoTask[] = typeof order.sunoTasks === 'string'
    ? JSON.parse(order.sunoTasks)
    : (order.sunoTasks || []);

  if (sunoTasks.length === 0) {
    console.error(`[MUSIC-POLL] Nenhuma task encontrada para: ${orderId}`);
    return 'failed';
  }

  const retryCount = parseInt(String(order.musicRetryCount || '0'));
  const MAX_RETRIES = 30; // 30 x 10s = 5 minutos

  if (retryCount >= MAX_RETRIES) {
    console.error(`[MUSIC-POLL] Timeout após ${MAX_RETRIES} tentativas para: ${orderId}`);
    await updateOrder(orderId, {
      musicStatus: 'failed',
      musicError: `Timeout: geração não completou em ${MAX_RETRIES * 10}s`,
    });
    return 'failed';
  }

  try {
    // Buscar status de todas as tasks no Suno
    const allTaskIds = sunoTasks.map(t => t.taskId);
    const results = await checkStatus(allTaskIds);

    // Atualizar status de cada task
    let allCompleted = true;
    let anyFailed = false;

    for (const task of sunoTasks) {
      const result = results.find(r => r.id === task.taskId);
      if (result) {
        task.status = result.status;
        if (result.audioUrl) {
          task.audioUrls = [result.audioUrl];
          task.completedAt = new Date().toISOString();
        }
        if (result.error) {
          task.error = result.error;
        }
      }

      if (task.status !== 'completed') allCompleted = false;
      if (task.status === 'failed') anyFailed = true;
    }

    // Salvar progresso
    await updateOrder(orderId, {
      sunoTasks: JSON.stringify(sunoTasks),
      musicRetryCount: String(retryCount + 1),
    });

    // Se todas as tasks com pelo menos 1 áudio completo → sucesso
    const completedTasks = sunoTasks.filter(t => t.status === 'completed' && t.audioUrls.length > 0);

    if (allCompleted || completedTasks.length >= (order.plan === 'premium' ? 2 : 1)) {
      const musicUrls = completedTasks.map(t => t.audioUrls[0]);

      await updateOrder(orderId, {
        musicStatus: 'completed',
        musicUrls: JSON.stringify(musicUrls),
        musicCompletedAt: new Date().toISOString(),
        sunoTasks: JSON.stringify(sunoTasks),
      });

      console.log(`[MUSIC-POLL] Geração completa! ${musicUrls.length} músicas prontas`);
      return 'completed';
    }

    // Se todas falharam
    if (anyFailed && sunoTasks.every(t => t.status === 'failed')) {
      await updateOrder(orderId, {
        musicStatus: 'failed',
        musicError: 'Todas as gerações falharam no Suno',
      });
      return 'failed';
    }

    // Ainda processando → agendar próximo poll
    console.log(`[MUSIC-POLL] Ainda processando... (retry ${retryCount + 1}/${MAX_RETRIES})`);
    await scheduleStatusPoll(orderId, 10);
    return 'processing';

  } catch (error) {
    console.error(`[MUSIC-POLL] Erro ao verificar status:`, error);

    await updateOrder(orderId, {
      musicRetryCount: String(retryCount + 1),
    });

    if (retryCount + 1 < MAX_RETRIES) {
      await scheduleStatusPoll(orderId, 15);
      return 'processing';
    }

    await updateOrder(orderId, {
      musicStatus: 'failed',
      musicError: error instanceof Error ? error.message : 'Erro desconhecido no polling',
    });
    return 'failed';
  }
}
