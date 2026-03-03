import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { saveOrder } from '@/lib/orderStore';

const PRECOS_CENTAVOS: Record<string, number> = {
  basico: 3990,
  premium: 7990,
};

const PRECOS_REAIS: Record<string, number> = {
  basico: 39.90,
  premium: 79.90,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderData } = body;

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return NextResponse.json({ error: 'Gateway de pagamento não configurado' }, { status: 500 });
    }

    const plan = orderData?.plan || 'basico';
    const precoReais = PRECOS_REAIS[plan] || PRECOS_REAIS.basico;
    const precoCentavos = PRECOS_CENTAVOS[plan] || PRECOS_CENTAVOS.basico;

    // Gerar ID único do pedido
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // 1) Salvar pedido no Redis ANTES de criar pagamento
    const saved = await saveOrder(orderId, {
      orderId,
      amount: precoCentavos,
      plan,
      paymentMethod: 'pix',
      status: 'pending',
      customerName: orderData?.customerName || '',
      customerEmail: orderData?.customerEmail || '',
      customerWhatsapp: orderData?.customerWhatsapp || '',
      honoreeName: orderData?.honoreeName || '',
      relationship: orderData?.relationship || '',
      relationshipLabel: orderData?.relationshipLabel || '',
      occasion: orderData?.occasion || '',
      occasionLabel: orderData?.occasionLabel || '',
      musicStyle: orderData?.musicStyle || '',
      musicStyleLabel: orderData?.musicStyleLabel || '',
      musicStyle2: orderData?.musicStyle2 || '',
      musicStyle2Label: orderData?.musicStyle2Label || '',
      voicePreference: orderData?.voicePreference || '',
      storyAndMessage: orderData?.storyAndMessage || '',
      familyNames: orderData?.familyNames || '',
      generatedLyrics: orderData?.generatedLyrics || '',
      knowsBabySex: orderData?.knowsBabySex || '',
      babySex: orderData?.babySex || '',
      babyNameBoy: orderData?.babyNameBoy || '',
      babyNameGirl: orderData?.babyNameGirl || '',
    });

    if (!saved) {
      console.error('Erro ao salvar pedido no Redis');
    }

    // 2) Criar pagamento PIX no Mercado Pago
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: precoReais,
        payment_method_id: 'pix',
        description: `Música personalizada para ${orderData?.honoreeName || 'Presente'}`,
        payer: {
          email: orderData?.customerEmail || 'cliente@email.com',
          first_name: orderData?.customerName?.split(' ')[0] || 'Cliente',
          last_name: orderData?.customerName?.split(' ').slice(1).join(' ') || '',
        },
        external_reference: orderId,
        statement_descriptor: 'CANTOSMEMORIAS',
      },
      requestOptions: {
        idempotencyKey: `pix-${orderId}`,
      },
    });

    console.log('=== PIX MERCADO PAGO ===');
    console.log('Order:', orderId);
    console.log('Payment ID:', result.id);
    console.log('Status:', result.status);

    // Extrair dados do QR Code PIX
    const transactionData = result.point_of_interaction?.transaction_data;
    const qrCode = transactionData?.qr_code || '';
    const qrCodeBase64 = transactionData?.qr_code_base64 || '';
    const ticketUrl = transactionData?.ticket_url || '';

    if (!qrCode && !qrCodeBase64) {
      console.error('Mercado Pago não retornou QR Code PIX');
      console.error('Result:', JSON.stringify(result, null, 2));
      return NextResponse.json({ error: 'Erro ao gerar QR Code PIX' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: result.id,
      qrCode,
      qrCodeBase64: `data:image/png;base64,${qrCodeBase64}`,
      ticketUrl,
      expiresAt: result.date_of_expiration || '',
    });

  } catch (error: any) {
    console.error('Erro ao criar PIX via MP:', error);

    // Erro específico: conta MP sem chave PIX
    const errorMsg = error.message || '';
    if (errorMsg.includes('key enabled for QR') || errorMsg.includes('Collector user')) {
      return NextResponse.json(
        { error: 'Chave PIX não cadastrada na conta Mercado Pago. Configure uma chave PIX no app do Mercado Pago.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: errorMsg || 'Erro ao gerar PIX. Tente novamente.' },
      { status: 500 }
    );
  }
}
