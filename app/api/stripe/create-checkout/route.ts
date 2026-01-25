import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { saveOrder } from '@/lib/orderStore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
  maxNetworkRetries: 3,
});

// Preços em centavos
const PRECOS = {
  basico: 5990,  // R$ 59,90
  premium: 7990  // R$ 79,90
};

const PLANO_NOMES = {
  basico: 'Plano Básico - 1 Música Personalizada',
  premium: 'Plano Premium - 2 Músicas Personalizadas'
};

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY não configurado');
      return NextResponse.json(
        { error: 'Gateway de pagamento não configurado' },
        { status: 500 }
      );
    }

    // Determinar o plano e preço
    const plan = orderData.plan || 'basico';
    const preco = PRECOS[plan as keyof typeof PRECOS] || PRECOS.basico;
    const planoNome = PLANO_NOMES[plan as keyof typeof PLANO_NOMES] || PLANO_NOMES.basico;

    // Gerar ID único do pedido
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Salvar dados completos do pedido no Redis ANTES de criar o checkout
    await saveOrder(orderId, {
      orderId,
      amount: preco,
      plan: plan,
      paymentMethod: 'card',
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
      voicePreference: orderData.voicePreference || '',
      storyAndMessage: orderData.storyAndMessage || '',
      generatedLyrics: orderData.generatedLyrics || '',
      status: 'pending',
    });

    // URL base do site - garantir que começa com https://
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cantosdememorias.com.br';

    // Remover espaços e garantir formato correto
    baseUrl = baseUrl.trim();
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }
    // Remover barra final se existir
    baseUrl = baseUrl.replace(/\/$/, '');

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: planoNome,
              description: `Música personalizada para ${orderData.honoreeName || 'seu ente querido'}`,
            },
            unit_amount: preco,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${baseUrl}?canceled=true`,
      customer_email: orderData.customerEmail,
      metadata: {
        orderId: orderId,
        plan: plan,
        customerName: orderData.customerName,
        customerWhatsapp: orderData.customerWhatsapp,
        honoreeName: orderData.honoreeName,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      orderId: orderId
    });

  } catch (error: any) {
    console.error('Erro ao criar checkout Stripe:', error);
    const errorMessage = error?.message || 'Erro ao processar pagamento';
    const stripeError = error?.type || 'unknown';
    console.error('Stripe Error Type:', stripeError);
    console.error('Stripe Error Message:', errorMessage);
    return NextResponse.json(
      { error: errorMessage, type: stripeError },
      { status: 500 }
    );
  }
}
