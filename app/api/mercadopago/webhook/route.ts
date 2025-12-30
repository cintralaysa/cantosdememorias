import { NextResponse } from 'next/server';
import { getPayment } from '@/lib/mercadopago';
import { getOrderById, updateOrder } from '@/lib/db';
import { sendOrderNotification } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('Mercado Pago Webhook received:', JSON.stringify(body, null, 2));

    // Verificar tipo de notificação
    if (body.type === 'payment') {
      const paymentId = body.data?.id;

      if (!paymentId) {
        console.log('No payment ID in webhook');
        return NextResponse.json({ received: true });
      }

      // Buscar detalhes do pagamento
      const payment = await getPayment(Number(paymentId));

      console.log('Payment details:', JSON.stringify(payment, null, 2));

      const orderId = payment.external_reference;
      const status = payment.status;
      const paymentMethodId = payment.payment_method_id;

      if (!orderId) {
        console.log('No external_reference (orderId) in payment');
        return NextResponse.json({ received: true });
      }

      // Buscar pedido
      const order = await getOrderById(orderId);

      if (!order) {
        console.log('Order not found:', orderId);
        return NextResponse.json({ received: true });
      }

      // Determinar método de pagamento
      let paymentMethod: 'card' | 'pix' | 'unknown' = 'unknown';
      if (paymentMethodId === 'pix') {
        paymentMethod = 'pix';
      } else if (['credit_card', 'debit_card', 'visa', 'master', 'amex', 'elo', 'hipercard'].includes(paymentMethodId || '')) {
        paymentMethod = 'card';
      }

      // Atualizar status baseado no status do pagamento
      let newStatus: 'pending' | 'pending_pix' | 'paid' | 'completed' | 'cancelled' = order.status;

      switch (status) {
        case 'approved':
          newStatus = 'paid';
          break;
        case 'pending':
        case 'in_process':
          newStatus = paymentMethod === 'pix' ? 'pending_pix' : 'pending';
          break;
        case 'rejected':
        case 'cancelled':
        case 'refunded':
        case 'charged_back':
          newStatus = 'cancelled';
          break;
      }

      // Atualizar pedido se status mudou
      if (newStatus !== order.status || order.paymentMethod === 'unknown') {
        const updatedOrder = await updateOrder(orderId, {
          status: newStatus,
          paymentMethod,
          stripePaymentIntentId: paymentId.toString(), // Reutilizando campo para MP payment ID
        });

        // Enviar notificação se pagamento aprovado
        if (newStatus === 'paid' && updatedOrder) {
          await sendOrderNotification(updatedOrder);
        }

        console.log('Order updated:', orderId, 'Status:', newStatus);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    // Sempre retornar 200 para evitar reenvios
    return NextResponse.json({ received: true });
  }
}

// Mercado Pago também pode enviar GET para verificar endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
