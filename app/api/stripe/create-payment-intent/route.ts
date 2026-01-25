import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Preços em centavos
const PRECOS = {
  basico: 5990,  // R$ 59,90
  premium: 7990  // R$ 79,90
};

export async function POST(request: NextRequest) {
  try {
    const { plan, customerEmail, customerName, orderId } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY não configurado');
      return NextResponse.json(
        { error: 'Gateway de pagamento não configurado' },
        { status: 500 }
      );
    }

    const preco = PRECOS[plan as keyof typeof PRECOS] || PRECOS.basico;

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
