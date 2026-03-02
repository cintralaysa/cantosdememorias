import { NextRequest, NextResponse } from 'next/server';
import { pollMusicStatus } from '@/lib/musicGeneration';
import { getOrderIdByTaskId } from '@/lib/orderStore';

// POST /api/music/callback — Callback do Suno API quando a musica fica pronta
// Recebe taskId do Suno, mapeia para orderId, e dispara polling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[SUNO-CALLBACK] Recebido:', JSON.stringify(body).substring(0, 1000));

    // 1. Se vier orderId direto (chamada interna), usar
    let orderId = body.orderId;

    // 2. Se não tem orderId, tentar extrair taskId e buscar no Redis
    if (!orderId) {
      const taskId = body.taskId || body.data?.taskId;
      if (taskId) {
        console.log(`[SUNO-CALLBACK] Buscando orderId para taskId: ${taskId}`);
        orderId = await getOrderIdByTaskId(taskId);
        if (orderId) {
          console.log(`[SUNO-CALLBACK] Encontrado orderId: ${orderId} para taskId: ${taskId}`);
        } else {
          console.warn(`[SUNO-CALLBACK] orderId não encontrado para taskId: ${taskId}`);
        }
      }
    }

    if (orderId) {
      const result = await pollMusicStatus(orderId);
      console.log(`[SUNO-CALLBACK] Poll result for ${orderId}: ${result}`);
      return NextResponse.json({ success: true, status: result, orderId });
    }

    // Se nao tem orderId nem taskId mapeável, logar para debug
    console.log('[SUNO-CALLBACK] Callback sem orderId/taskId mapeável - apenas log');
    return NextResponse.json({ success: true, message: 'Callback recebido (sem orderId)' });

  } catch (error) {
    console.error('[SUNO-CALLBACK] Erro:', error);
    return NextResponse.json({ error: 'Erro no callback' }, { status: 500 });
  }
}
