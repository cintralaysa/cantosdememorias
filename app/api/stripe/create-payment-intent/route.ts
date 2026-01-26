import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { saveOrder } from '@/lib/orderStore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
  maxNetworkRetries: 3,
});

// Preços em centavos
const PRECOS = {
  basico: 4990,  // R$ 49,90
  premium: 7990  // R$ 79,90
};

export async function POST(request: NextRequest) {
  try {
    const { plan, customerEmail, customerName, orderId, orderData } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY não configurado');
      return NextResponse.json(
        { error: 'Gateway de pagamento não configurado' },
        { status: 500 }
      );
    }

    const preco = PRECOS[plan as keyof typeof PRECOS] || PRECOS.basico;

    // Salvar dados do pedido no Redis se fornecidos
    if (orderData) {
      try {
        await saveOrder(orderId, {
          orderId,
          amount: preco,
          plan: plan,
          paymentMethod: 'card',
          customerName: orderData.customerName || customerName || '',
          customerEmail: orderData.customerEmail || customerEmail || '',
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
          generatedLyrics: orderData.generatedLyrics || orderData.approvedLyrics || '',
          status: 'pending',
        });
      } catch (saveError) {
        console.error('Erro ao salvar pedido no Redis:', saveError);
        // Continua mesmo se falhar o save, pois o pagamento é mais importante
      }
    }

    // Criar Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: preco,
      currency: 'brl',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: orderId,
        plan: plan,
        customerName: customerName,
      },
      receipt_email: customerEmail,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error('Erro ao criar Payment Intent:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
