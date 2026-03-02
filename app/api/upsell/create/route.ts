import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrder } from '@/lib/orderStore';

const OPENPIX_APP_ID = process.env.OPENPIX_APP_ID;
const UPSELL_PRICE = 1990; // R$ 19,90 em centavos
const UPSELL_PRICE_FORMATTED = 'R$ 19,90';

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
    }

    if (!OPENPIX_APP_ID) {
      return NextResponse.json({ error: 'Gateway de pagamento não configurado' }, { status: 500 });
    }

    // Verificar se o pedido existe
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Verificar se tem música completada (só permite upsell após ter música pronta)
    if (order.musicStatus !== 'completed') {
      return NextResponse.json({ error: 'Aguarde sua música ficar pronta antes de comprar mais' }, { status: 400 });
    }

    // Verificar se já comprou upsell (só permite 1 vez por pedido)
    if (order.upsellPurchased) {
      return NextResponse.json({ error: 'Você já adquiriu a música extra neste pedido' }, { status: 400 });
    }

    // Criar correlationID único para o upsell
    const upsellId = `UPSELL-${orderId}-${Date.now()}`;

    // Salvar referência do upsell no Redis (mapeamento upsellId → orderId original)
    const UPSTASH_URL = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
    const UPSTASH_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();

    if (UPSTASH_URL && UPSTASH_TOKEN) {
      await fetch(`${UPSTASH_URL}/set/upsell:${upsellId}?EX=7200`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderId),
      });
    }

    // Criar cobrança PIX na OpenPix
    const pixResponse = await fetch('https://api.openpix.com.br/api/v1/charge', {
      method: 'POST',
      headers: {
        'Authorization': OPENPIX_APP_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correlationID: upsellId,
        value: UPSELL_PRICE,
        comment: `Música extra para ${order.honoreeName || 'presente'} (upsell)`,
        customer: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerWhatsapp?.replace(/\D/g, ''),
        },
        additionalInfo: [
          { key: 'Tipo', value: 'Upsell - Música Extra' },
          { key: 'Pedido Original', value: orderId },
          { key: 'Homenageado', value: order.honoreeName || 'N/A' },
        ],
        expiresIn: 1800, // 30 min para pagar
      }),
    });

    if (!pixResponse.ok) {
      const errorData = await pixResponse.text();
      console.error('[UPSELL] Erro OpenPix:', errorData);
      return NextResponse.json({ error: 'Erro ao gerar PIX' }, { status: 500 });
    }

    const pixData = await pixResponse.json();

    console.log(`[UPSELL] PIX criado: ${upsellId} → pedido original ${orderId}`);

    return NextResponse.json({
      success: true,
      upsellId,
      orderId,
      pixData: {
        qrCode: pixData.charge?.qrCodeImage || pixData.qrCodeImage,
        pixCopiaECola: pixData.charge?.brCode || pixData.brCode,
        expiresAt: pixData.charge?.expiresAt || pixData.expiresAt,
        value: UPSELL_PRICE,
        valueFormatted: UPSELL_PRICE_FORMATTED,
      },
    });
  } catch (error) {
    console.error('[UPSELL] Erro:', error);
    return NextResponse.json({ error: 'Erro ao processar upsell' }, { status: 500 });
  }
}
