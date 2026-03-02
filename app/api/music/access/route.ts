import { NextRequest, NextResponse } from 'next/server';
import { getOrderByAccessCode } from '@/lib/orderStore';

// POST /api/music/access — Buscar pedido pelo código de acesso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessCode } = body;

    if (!accessCode) {
      return NextResponse.json({ error: 'Código de acesso é obrigatório' }, { status: 400 });
    }

    // Normalizar: uppercase, remover espaços
    const code = accessCode.trim().toUpperCase();

    const order = await getOrderByAccessCode(code);

    if (!order) {
      return NextResponse.json({ error: 'Código não encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId || order.correlationID,
      musicStatus: order.musicStatus || 'pending',
      honoreeName: order.honoreeName,
    });

  } catch (error) {
    console.error('[MUSIC-ACCESS] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar código' },
      { status: 500 }
    );
  }
}
