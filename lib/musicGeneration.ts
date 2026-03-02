// Orquestrador de geração de música via Suno AI
// Modelo: 1 música por vez, com sistema de créditos (Básico=1, Premium=3)

import { getOrder, updateOrder, saveAccessCodeIndex, saveTaskIndex, SongRecord } from './orderStore';
import { submitGeneration, checkTaskStatus } from './sunoClient';
import { getSunoStylePrompt, generateSongTitle } from './musicStyles';
import { scheduleStatusPoll } from './qstash';

export interface SunoTask {
  taskId: string;
  songId: number; // Qual música esse task pertence (1, 2, 3)
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

// Helper: parsear songs do Redis
function parseSongs(order: any): SongRecord[] {
  if (!order.songs) return [];
  return typeof order.songs === 'string' ? JSON.parse(order.songs) : order.songs;
}

// 1. Iniciar geração da PRIMEIRA música (chamado pelo webhook PIX ou teste)
// Gera apenas 1 música, mesmo para Premium (as outras ficam como créditos)
export async function startMusicGeneration(orderId: string): Promise<void> {
  console.log(`[MUSIC-GEN] Iniciando geração para pedido: ${orderId}`);

  const order = await getOrder(orderId);
  if (!order) {
    throw new Error(`[MUSIC-GEN] Pedido não encontrado: ${orderId}`);
  }

  // Já completo? Ignorar
  if (order.musicStatus === 'completed') {
    console.log(`[MUSIC-GEN] Pedido já completo, ignorando`);
    return;
  }

  // Já está gerando? Verificar se ficou preso (> 5 minutos)
  if (order.musicStatus === 'generating') {
    const startedAt = order.musicStartedAt ? new Date(order.musicStartedAt).getTime() : 0;
    const elapsed = Date.now() - startedAt;
    const STUCK_THRESHOLD = 5 * 60 * 1000; // 5 minutos

    if (startedAt > 0 && elapsed < STUCK_THRESHOLD) {
      console.log(`[MUSIC-GEN] Pedido já em generating há ${Math.round(elapsed / 1000)}s, ignorando`);
      return;
    }
    // Preso por > 5 min — resetar e tentar novamente
    console.log(`[MUSIC-GEN] Pedido preso em generating há ${Math.round(elapsed / 1000)}s, resetando...`);
  }

  const lyrics = order.generatedLyrics || order.approvedLyrics || '';
  if (!lyrics) {
    throw new Error(`[MUSIC-GEN] Pedido sem letra: ${orderId}`);
  }

  const honoreeName = order.honoreeName || 'Alguém Especial';
  const occasion = order.occasion || 'outro';
  const style = order.musicStyle || 'pop';
  const styleLabel = order.musicStyleLabel || style;
  const creditsTotal = order.plan === 'premium' ? 3 : 1;

  try {
    const sunoStyle = getSunoStylePrompt(style);
    const title = generateSongTitle(honoreeName, occasion);

    console.log(`[MUSIC-GEN] Estilo: ${styleLabel} → "${sunoStyle}"`);

    const taskId = await submitGeneration({
      title,
      lyrics,
      style: sunoStyle,
    });

    const sunoTask: SunoTask = {
      taskId,
      songId: 1,
      style,
      styleLabel,
      status: 'submitted',
      audioUrls: [],
      submittedAt: new Date().toISOString(),
    };

    // Criar registro da primeira música
    const song: SongRecord = {
      id: 1,
      lyrics,
      musicStyle: style,
      musicStyleLabel: styleLabel,
      honoreeName,
      occasion,
      status: 'generating',
      sunoTaskId: taskId,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Gerar código de acesso
    const accessCode = generateAccessCode();

    // Salvar tudo no Redis
    await updateOrder(orderId, {
      musicStatus: 'generating',
      sunoTasks: JSON.stringify([sunoTask]),
      songs: JSON.stringify([song]),
      creditsTotal,
      creditsUsed: 1,
      musicStartedAt: new Date().toISOString(),
      musicRetryCount: '0',
      accessCode,
    });

    // Salvar índices reversos
    await saveAccessCodeIndex(accessCode, orderId);
    await saveTaskIndex(taskId, orderId);

    // Agendar primeiro polling em 30 segundos
    await scheduleStatusPoll(orderId, 30);

    console.log(`[MUSIC-GEN] Geração iniciada! 1 música, créditos: 1/${creditsTotal}, código: ${accessCode}`);

  } catch (error) {
    console.error(`[MUSIC-GEN] Erro ao iniciar geração:`, error);

    await updateOrder(orderId, {
      musicStatus: 'failed',
      musicError: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    throw error;
  }
}

// 2. Criar música adicional usando créditos (chamado pelo portal do cliente)
export async function startAdditionalSong(
  orderId: string,
  lyrics: string,
  musicStyle: string,
  musicStyleLabel: string,
  honoreeName?: string,
  occasion?: string,
): Promise<{ songId: number }> {
  console.log(`[MUSIC-GEN] Criando música adicional para: ${orderId}`);

  const order = await getOrder(orderId);
  if (!order) {
    throw new Error('Pedido não encontrado');
  }

  const creditsTotal = order.creditsTotal || (order.plan === 'premium' ? 3 : 1);
  const creditsUsed = order.creditsUsed || 0;
  const songs = parseSongs(order);

  if (creditsUsed >= creditsTotal) {
    throw new Error('Sem créditos disponíveis');
  }

  // Verificar se já tem alguma música gerando
  const generating = songs.find(s => s.status === 'generating');
  if (generating) {
    throw new Error('Aguarde a música atual terminar antes de criar outra');
  }

  const name = honoreeName || order.honoreeName || 'Alguém Especial';
  const occ = occasion || order.occasion || 'outro';
  const songId = songs.length + 1;

  try {
    const sunoStyle = getSunoStylePrompt(musicStyle);
    const title = generateSongTitle(name, occ);

    const taskId = await submitGeneration({
      title,
      lyrics,
      style: sunoStyle,
    });

    // Adicionar task
    const sunoTasks: SunoTask[] = typeof order.sunoTasks === 'string'
      ? JSON.parse(order.sunoTasks) : (order.sunoTasks || []);

    sunoTasks.push({
      taskId,
      songId,
      style: musicStyle,
      styleLabel: musicStyleLabel,
      status: 'submitted',
      audioUrls: [],
      submittedAt: new Date().toISOString(),
    });

    // Adicionar song
    const newSong: SongRecord = {
      id: songId,
      lyrics,
      musicStyle,
      musicStyleLabel,
      honoreeName: name,
      occasion: occ,
      status: 'generating',
      sunoTaskId: taskId,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };
    songs.push(newSong);

    await updateOrder(orderId, {
      musicStatus: 'generating',
      sunoTasks: JSON.stringify(sunoTasks),
      songs: JSON.stringify(songs),
      creditsUsed: creditsUsed + 1,
      musicRetryCount: '0',
    });

    await saveTaskIndex(taskId, orderId);
    await scheduleStatusPoll(orderId, 30);

    console.log(`[MUSIC-GEN] Música adicional #${songId} iniciada! Créditos: ${creditsUsed + 1}/${creditsTotal}`);
    return { songId };

  } catch (error) {
    console.error(`[MUSIC-GEN] Erro ao criar música adicional:`, error);
    throw error;
  }
}

// 3. Verificar status (chamado pelo QStash a cada 15s)
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
  const MAX_RETRIES = 30;

  if (retryCount >= MAX_RETRIES) {
    console.error(`[MUSIC-POLL] Timeout após ${MAX_RETRIES} tentativas`);
    // Marcar songs em generating como failed
    const songs = parseSongs(order);
    for (const song of songs) {
      if (song.status === 'generating') {
        song.status = 'failed';
        song.error = 'Timeout na geração';
      }
    }
    await updateOrder(orderId, {
      musicStatus: 'failed',
      musicError: `Timeout: geração não completou em ${MAX_RETRIES * 15}s`,
      songs: JSON.stringify(songs),
    });
    return 'failed';
  }

  try {
    const songs = parseSongs(order);
    let anyGenerating = false;
    let allAudioUrls: string[] = [];

    // Verificar apenas tasks que ainda não completaram
    for (const task of sunoTasks) {
      if (task.status === 'completed' && task.audioUrls.length > 0) {
        allAudioUrls.push(task.audioUrls[0]); // Usa o primeiro áudio de cada task
        continue;
      }

      const result = await checkTaskStatus(task.taskId);
      console.log(`[MUSIC-POLL] Task ${task.taskId}: status=${result.status}, audios=${result.audios.length}`);

      if (result.status === 'completed') {
        task.status = 'completed';
        task.completedAt = new Date().toISOString();

        if (result.audios.length > 0) {
          task.audioUrls = result.audios.map(a => a.audioUrl);
          allAudioUrls.push(task.audioUrls[0]);
        } else {
          console.warn(`[MUSIC-POLL] ⚠️ Task ${task.taskId} completou SEM áudios — marcando como completo mesmo assim`);
        }

        // Atualizar o song correspondente
        const song = songs.find(s => s.sunoTaskId === task.taskId);
        if (song) {
          song.status = 'completed';
          song.audioUrl = task.audioUrls?.[0] || '';
          song.completedAt = new Date().toISOString();
        }
      } else if (result.status === 'failed') {
        task.status = 'failed';
        task.error = result.error;
        const song = songs.find(s => s.sunoTaskId === task.taskId);
        if (song) {
          song.status = 'failed';
          song.error = result.error || 'Falha na geração';
        }
      } else {
        // pending ou processing — continuar polling
        anyGenerating = true;
        if (result.audios.length > 0) {
          task.audioUrls = result.audios.map(a => a.audioUrl);
        }
      }
    }

    // Salvar progresso
    await updateOrder(orderId, {
      sunoTasks: JSON.stringify(sunoTasks),
      songs: JSON.stringify(songs),
      musicRetryCount: String(retryCount + 1),
    });

    // Se ainda tem algo gerando, continuar polling
    if (anyGenerating) {
      console.log(`[MUSIC-POLL] Processando... (retry ${retryCount + 1}/${MAX_RETRIES})`);
      await scheduleStatusPoll(orderId, 15);
      return 'processing';
    }

    // Nenhuma task gerando - verificar se pelo menos 1 música completou
    const completedSongs = songs.filter(s => s.status === 'completed');
    if (completedSongs.length > 0) {
      // Salvar TODAS as URLs (2 melodias por task)
      const musicUrls: string[] = [];
      for (const task of sunoTasks) {
        if (task.status === 'completed' && task.audioUrls.length > 0) {
          musicUrls.push(...task.audioUrls);
        }
      }
      // Fallback: se sunoTasks não tem URLs, pegar das songs
      if (musicUrls.length === 0) {
        musicUrls.push(...completedSongs.map(s => s.audioUrl!).filter(Boolean));
      }
      await updateOrder(orderId, {
        musicStatus: 'completed',
        musicUrls: JSON.stringify(musicUrls),
        musicCompletedAt: new Date().toISOString(),
        songs: JSON.stringify(songs),
      });

      console.log(`[MUSIC-POLL] COMPLETO! ${completedSongs.length} música(s) prontas`);
      return 'completed';
    }

    // Tudo falhou
    await updateOrder(orderId, {
      musicStatus: 'failed',
      musicError: 'Todas as gerações falharam',
      songs: JSON.stringify(songs),
    });
    return 'failed';

  } catch (error) {
    console.error(`[MUSIC-POLL] Erro:`, error);

    await updateOrder(orderId, {
      musicRetryCount: String(retryCount + 1),
    });

    if (retryCount + 1 < MAX_RETRIES) {
      await scheduleStatusPoll(orderId, 15);
      return 'processing';
    }

    await updateOrder(orderId, {
      musicStatus: 'failed',
      musicError: error instanceof Error ? error.message : 'Erro no polling',
    });
    return 'failed';
  }
}
