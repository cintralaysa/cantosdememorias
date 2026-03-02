import { NextRequest, NextResponse } from 'next/server';
import { startMusicGeneration } from '@/lib/musicGeneration';

// POST /api/music/generate — Dispara geração de música no Suno
// Chamado internamente pelo webhook PIX após confirmação de pagamento
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação interna
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.INTERNAL_API_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      console.error('[MUSIC-GENERATE] Autenticação inválida');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
    }

    console.log(`[MUSIC-GENERATE] Iniciando geração para: ${orderId}`);

    await startMusicGeneration(orderId);

    return NextResponse.json({
      success: true,
      message: 'Geração de música iniciada',
      orderId,
    });

  } catch (error) {
    console.error('[MUSIC-GENERATE] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao iniciar geração', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
