import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { saveOrder } from '@/lib/orderStore';

// Preços em centavos (Redis) e reais (Mercado Pago)
const PRECOS = {
  basico: 3990,
  premium: 7990,
};
const PRECOS_MP = {
  basico: 39.90,
  premium: 79.90,
};

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    const plan = orderData.plan || 'basico';
    const preco = PRECOS[plan as keyof typeof PRECOS] || PRECOS.basico;
    const precoMP = PRECOS_MP[plan as keyof typeof PRECOS_MP] || PRECOS_MP.basico;

    // Gerar ID único do pedido (mesmo padrão do PIX)
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const correlationID = orderId;

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return NextResponse.json(
        { error: 'Gateway de pagamento não configurado' },
        { status: 500 }
      );
    }

    // 1) Salvar dados completos do pedido no Redis ANTES de criar o pagamento
    const saved = await saveOrder(correlationID, {
      orderId,
      amount: preco,
      plan,
      paymentMethod: 'card',
      status: 'pending',
      customerName: orderData.customerName || '',
      customerEmail: orderData.customerEmail || '',
      customerWhatsapp: orderData.customerWhatsapp || '',
      honoreeName: orderData.honoreeName || '',
      relationship: orderData.relationship || '',
      relationshipLabel: orderData.relationshipLabel || '',
      occasion: orderData.occasion || '',
      occasionLabel: orderData.occasionLabel || '',
      musicStyle: orderData.musicStyle || '',
      musicStyleLabel: orderData.musicStyleLabel || '',
      musicStyle2: orderData.musicStyle2 || '',
      musicStyle2Label: orderData.musicStyle2Label || '',
      voicePreference: orderData.voicePreference || '',
      storyAndMessage: orderData.storyAndMessage || '',
      familyNames: orderData.familyNames || '',
      generatedLyrics: orderData.generatedLyrics || '',
      knowsBabySex: orderData.knowsBabySex || '',
      babySex: orderData.babySex || '',
      babyNameBoy: orderData.babyNameBoy || '',
      babyNameGirl: orderData.babyNameGirl || '',
    });

    if (!saved) {
      console.error('Erro ao salvar pedido no Redis - continuando mesmo assim');
    }

    // 2) Criar Preference no Mercado Pago
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cantosdememorias.com.br')
      .replace(/\/$/, '');

    const planLabel = plan === 'premium' ? 'Premium (3 Músicas)' : 'Básico (1 Música)';

    const result = await preference.create({
      body: {
        items: [
          {
            id: orderId,
            title: `Música Personalizada ${planLabel} - ${orderData.honoreeName || 'Presente'}`,
            quantity: 1,
            unit_price: precoMP,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: orderData.customerName || undefined,
          email: orderData.customerEmail || undefined,
        },
        back_urls: {
          success: `${baseUrl}/pagamento/sucesso?orderId=${orderId}&source=mercadopago`,
          failure: `${baseUrl}/checkout?error=payment_failed&orderId=${orderId}`,
          pending: `${baseUrl}/pagamento/sucesso?orderId=${orderId}&source=mercadopago&status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        external_reference: orderId,
        statement_descriptor: 'CANTOSMEMORIAS',
      },
    });

    console.log('=== MERCADO PAGO - PREFERÊNCIA CRIADA ===');
    console.log('Order ID:', orderId);
    console.log('Plano:', planLabel);
    console.log('Valor: R$', precoMP.toFixed(2));
    console.log('Init Point:', result.init_point ? 'OK' : 'ERRO');
    console.log('Dados salvos no Redis:', saved ? 'SIM' : 'NÃO');

    return NextResponse.json({
      success: true,
      orderId,
      correlationID,
      plan,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
    });
  } catch (error) {
    console.error('Erro ao criar pagamento Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento com cartão' },
      { status: 500 }
    );
  }
}
