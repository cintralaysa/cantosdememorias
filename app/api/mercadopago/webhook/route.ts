import { NextResponse } from 'next/server';
import { getMercadoPagoPayment } from '@/lib/mercadopago';
import { getOrderById, updateOrder } from '@/lib/db';

export async function POST(req: Request) {
  console.log('[WEBHOOK] Recebendo notificação do Mercado Pago');

  try {
    const body = await req.json();
    console.log('[WEBHOOK] Body:', JSON.stringify(body, null, 2));

    // Verificar tipo de notificação
    if (body.type === 'payment') {
      const paymentId = body.data?.id;

      if (!paymentId) {
        console.log('[WEBHOOK] Sem payment ID');
        return NextResponse.json({ received: true });
      }

      console.log('[WEBHOOK] Payment ID:', paymentId);

      // Buscar detalhes do pagamento
      const payment = await getMercadoPagoPayment(Number(paymentId));
      console.log('[WEBHOOK] Detalhes do pagamento:', JSON.stringify(payment, null, 2));

      const orderId = payment.external_reference;
      const status = payment.status;
      const paymentMethodId = payment.payment_method_id;

      if (!orderId) {
        console.log('[WEBHOOK] Sem external_reference (orderId)');
        return NextResponse.json({ received: true });
      }

      console.log('[WEBHOOK] Order ID:', orderId);
      console.log('[WEBHOOK] Status:', status);
      console.log('[WEBHOOK] Método:', paymentMethodId);

      // Buscar pedido
      const order = await getOrderById(orderId);

      if (!order) {
        console.log('[WEBHOOK] Pedido não encontrado:', orderId);
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
        await updateOrder(orderId, {
          status: newStatus,
          paymentMethod,
          stripePaymentIntentId: paymentId.toString(),
        });

        console.log('[WEBHOOK] Pedido atualizado:', orderId, 'Status:', newStatus);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Erro:', error);
    // Sempre retornar 200 para evitar reenvios
    return NextResponse.json({ received: true });
  }
}

// Mercado Pago também pode enviar GET para verificar endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Webhook Mercado Pago ativo' });
}
