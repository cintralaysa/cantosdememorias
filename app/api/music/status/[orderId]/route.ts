import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/orderStore';

// GET /api/music/status/[orderId] — Retorna status da geração
// Usado pelo frontend (página de sucesso e download)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
    }

    const order = await getOrder(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    const musicUrls = order.musicUrls ? JSON.parse(String(order.musicUrls)) : [];
    const retryCount = parseInt(String(order.musicRetryCount || '0'));

    return NextResponse.json({
      orderId,
      musicStatus: order.musicStatus || 'pending',
      musicUrls,
      accessCode: order.accessCode,
      honoreeName: order.honoreeName,
      customerName: order.customerName,
      occasion: order.occasionLabel || order.occasion,
      musicStyle: order.musicStyleLabel || order.musicStyle,
      plan: order.plan,
      generatedLyrics: order.generatedLyrics,
      musicStartedAt: order.musicStartedAt,
      musicCompletedAt: order.musicCompletedAt,
      musicError: order.musicError,
      estimatedSeconds: Math.max(0, 180 - (retryCount * 10)), // Estimativa decrescente
    });

  } catch (error) {
    console.error('[MUSIC-STATUS] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status' },
      { status: 500 }
    );
  }
}
