import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/orderStore';
import { startAdditionalSong } from '@/lib/musicGeneration';

// POST /api/music/create-song — Criar música adicional usando créditos
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, lyrics, musicStyle, musicStyleLabel, honoreeName, occasion } = body;

    if (!orderId || !lyrics || !musicStyle) {
      return NextResponse.json(
        { error: 'orderId, lyrics e musicStyle são obrigatórios' },
        { status: 400 }
      );
    }

    if (lyrics.trim().length < 20) {
      return NextResponse.json(
        { error: 'A letra precisa ter pelo menos 20 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se o pedido existe
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Verificar créditos
    const creditsTotal = order.creditsTotal || (order.plan === 'premium' ? 3 : 1);
    const creditsUsed = order.creditsUsed || 0;

    if (creditsUsed >= creditsTotal) {
      return NextResponse.json(
        { error: 'Sem créditos disponíveis. Todos os créditos já foram utilizados.' },
        { status: 400 }
      );
    }

    // Criar a música
    const result = await startAdditionalSong(
      orderId,
      lyrics.trim(),
      musicStyle,
      musicStyleLabel || musicStyle,
      honoreeName,
      occasion,
    );

    return NextResponse.json({
      success: true,
      songId: result.songId,
      creditsRemaining: creditsTotal - creditsUsed - 1,
      message: 'Música sendo gerada! Aguarde alguns minutos.',
    });

  } catch (error) {
    console.error('[CREATE-SONG] Erro:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar música' },
      { status: 500 }
    );
  }
}
