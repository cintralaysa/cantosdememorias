import { NextRequest, NextResponse } from 'next/server';
import { getOrder, SongRecord } from '@/lib/orderStore';

// GET /api/music/status/[orderId] — Retorna status da geração + créditos + songs
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

    // Parsear songs e musicUrls
    const songs: SongRecord[] = order.songs
      ? (typeof order.songs === 'string' ? JSON.parse(order.songs) : order.songs)
      : [];
    const musicUrls = order.musicUrls ? JSON.parse(String(order.musicUrls)) : [];
    const retryCount = parseInt(String(order.musicRetryCount || '0'));

    // Créditos (backward compatible: se não tem creditsTotal, calcular)
    const creditsTotal = order.creditsTotal ?? (order.plan === 'premium' ? 3 : 1);
    const creditsUsed = order.creditsUsed ?? songs.length ?? (musicUrls.length > 0 ? 1 : 0);
    const creditsRemaining = Math.max(0, creditsTotal - creditsUsed);

    // Parsear sunoTasks para expor todas as URLs de cada melodia
    const sunoTasks = order.sunoTasks
      ? (typeof order.sunoTasks === 'string' ? JSON.parse(order.sunoTasks) : order.sunoTasks)
      : [];

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
      estimatedSeconds: Math.max(0, 180 - (retryCount * 10)),
      creditsTotal,
      creditsUsed,
      creditsRemaining,
      songs,
      sunoTasks,
      upsellPurchased: !!order.upsellPurchased,
    });

  } catch (error) {
    console.error('[MUSIC-STATUS] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status' },
      { status: 500 }
    );
  }
}
