import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createOrder, Order } from '@/lib/db';
import { sendOrderNotification } from '@/lib/email';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Processar evento de pagamento bem-sucedido
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const metadata = session.metadata || {};

    // Determinar método de pagamento
    let paymentMethod: 'card' | 'pix' | 'unknown' = 'unknown';
    if (session.payment_method_types?.includes('card')) {
      paymentMethod = 'card';
    }
    if (session.payment_method_types?.includes('pix') || session.payment_method_types?.includes('boleto')) {
      // Verificar se foi PIX
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        if (paymentIntent.payment_method_types?.includes('pix')) {
          paymentMethod = 'pix';
        }
      } catch {
        // Se não conseguir verificar, manter o método detectado
      }
    }

    // Criar pedido no banco de dados
    const orderData: Omit<Order, 'id' | 'createdAt'> = {
      status: 'paid',
      paymentMethod,

      // Dados do cliente
      customerEmail: session.customer_email || metadata.email || '',
      customerName: metadata.userName || session.customer_details?.name || '',

      // Dados do pedido
      honoreeName: metadata.honoreeName || '',
      relationship: metadata.relationship || '',
      relationshipLabel: metadata.relationshipLabel || metadata.relationship || '',
      occasion: metadata.occasion || '',
      occasionLabel: metadata.occasionLabel || metadata.occasion || '',
      musicStyle: metadata.musicStyle || '',
      musicStyleLabel: metadata.musicStyleLabel || metadata.musicStyle || '',
      voicePreference: metadata.voicePreference || '',
      qualities: metadata.qualities || '',
      memories: metadata.memories || '',
      heartMessage: metadata.heartMessage || '',
      familyNames: metadata.familyNames || '',

      // Chá revelação
      knowsBabySex: metadata.knowsBabySex || '',
      babySex: metadata.babySex || '',
      babyNameBoy: metadata.babyNameBoy || '',
      babyNameGirl: metadata.babyNameGirl || '',

      // Letra aprovada
      approvedLyrics: metadata.approvedLyrics || '',

      // Pagamento
      amount: session.amount_total ? session.amount_total / 100 : 0,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent || '',
    };

    try {
      // Salvar pedido
      const order = await createOrder(orderData);
      console.log('Pedido salvo:', order.id);

      // Enviar e-mail de notificação
      await sendOrderNotification(order);
      console.log('E-mail de notificação enviado');
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
    }
  }

  return NextResponse.json({ received: true });
}
