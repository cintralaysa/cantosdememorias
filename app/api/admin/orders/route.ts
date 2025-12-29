import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedRequest } from '@/lib/auth';
import { getOrders, getOrderStats } from '@/lib/db';

export async function GET(request: NextRequest) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const statsOnly = url.searchParams.get('stats') === 'true';

    if (statsOnly) {
      const stats = await getOrderStats();
      return NextResponse.json(stats);
    }

    const orders = await getOrders();
    // Ordenar do mais recente para o mais antigo
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
}
