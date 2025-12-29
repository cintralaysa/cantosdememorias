import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedRequest } from '@/lib/auth';
import { getOrderById, updateOrder } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedido' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json(
      { error: 'Não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const updates = await request.json();

    const order = await updateOrder(id, updates);

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 500 }
    );
  }
}
