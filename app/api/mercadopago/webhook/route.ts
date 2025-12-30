import { NextResponse } from 'next/server';
import { getMercadoPagoPayment } from '@/lib/mercadopago';
import { getOrderById, updateOrder } from '@/lib/db';

// Função para enviar email de notificação
async function sendEmailNotification(paymentData: {
  paymentId: string;
  orderId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  payerEmail: string;
  payerName: string;
  itemTitle: string;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'laysaarthur3209@gmail.com';

  if (!RESEND_API_KEY) {
    console.log('[WEBHOOK] RESEND_API_KEY não configurada, pulando email');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .amount { font-size: 32px; font-weight: bold; color: #059669; }
        .badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; background: #d1fae5; color: #065f46; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Pagamento Aprovado!</h1>
          <p>Cantos de Memórias</p>
        </div>
        <div class="content">
          <div class="section">
            <p class="amount">R$ ${paymentData.amount.toFixed(2).replace('.', ',')}</p>
            <p><span class="badge">${paymentData.paymentMethod === 'pix' ? '✓ PIX' : '✓ Cartão'}</span></p>
          </div>
          <div class="section">
            <p><strong>ID do Pagamento:</strong> ${paymentData.paymentId}</p>
            <p><strong>Pedido:</strong> ${paymentData.orderId}</p>
            <p><strong>Produto:</strong> ${paymentData.itemTitle}</p>
          </div>
          <div class="section">
            <p><strong>Cliente:</strong> ${paymentData.payerName || 'Não informado'}</p>
            <p><strong>Email:</strong> ${paymentData.payerEmail || 'Não informado'}</p>
          </div>
          <div class="section" style="background: #fef3c7; border-left-color: #f59e0b;">
            <p><strong>⚠️ Ação necessária:</strong> Entre em contato com o cliente para coletar os detalhes do pedido e iniciar a produção da música!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Cantos de Memórias <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `💰 PAGAMENTO APROVADO! R$ ${paymentData.amount.toFixed(2).replace('.', ',')} - ${paymentData.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}`,
        html: htmlContent,
      }),
    });

    if (response.ok) {
      console.log('[WEBHOOK] Email de notificação enviado para', ADMIN_EMAIL);
    } else {
      const error = await response.json();
      console.error('[WEBHOOK] Erro ao enviar email:', error);
    }
  } catch (error) {
    console.error('[WEBHOOK] Erro ao enviar email:', error);
  }
}

export async function POST(req: Request) {
  console.log('[WEBHOOK] ========================================');
  console.log('[WEBHOOK] Recebendo notificação do Mercado Pago');
  console.log('[WEBHOOK] Timestamp:', new Date().toISOString());

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

      // Buscar detalhes do pagamento no Mercado Pago
      const payment = await getMercadoPagoPayment(Number(paymentId));
      console.log('[WEBHOOK] Status do pagamento:', payment.status);
      console.log('[WEBHOOK] Método:', payment.payment_method_id);
      console.log('[WEBHOOK] Valor:', payment.transaction_amount);

      const orderId = payment.external_reference;
      const status = payment.status;
      const paymentMethodId = payment.payment_method_id;

      // Determinar método de pagamento
      let paymentMethod: 'card' | 'pix' | 'unknown' = 'unknown';
      if (paymentMethodId === 'pix') {
        paymentMethod = 'pix';
      } else if (['credit_card', 'debit_card', 'visa', 'master', 'amex', 'elo', 'hipercard'].includes(paymentMethodId || '')) {
        paymentMethod = 'card';
      }

      // Se o pagamento foi APROVADO, enviar notificação por email
      if (status === 'approved') {
        console.log('[WEBHOOK] ✅ PAGAMENTO APROVADO! Enviando notificação...');

        await sendEmailNotification({
          paymentId: paymentId.toString(),
          orderId: orderId || 'N/A',
          amount: payment.transaction_amount || 0,
          status: 'approved',
          paymentMethod,
          payerEmail: payment.payer?.email || '',
          payerName: payment.payer?.first_name || payment.additional_info?.payer?.first_name || '',
          itemTitle: payment.additional_info?.items?.[0]?.title || 'Música Personalizada',
        });
      }

      // Tentar atualizar pedido local (se existir)
      if (orderId) {
        console.log('[WEBHOOK] Tentando atualizar pedido:', orderId);

        const order = await getOrderById(orderId);

        if (order) {
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

          if (newStatus !== order.status || order.paymentMethod === 'unknown') {
            await updateOrder(orderId, {
              status: newStatus,
              paymentMethod,
              stripePaymentIntentId: paymentId.toString(),
            });
            console.log('[WEBHOOK] Pedido atualizado:', orderId, 'Status:', newStatus);
          }
        } else {
          console.log('[WEBHOOK] Pedido não encontrado no banco local (normal em serverless)');
        }
      }
    }

    console.log('[WEBHOOK] ========================================');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Erro:', error);
    // Sempre retornar 200 para evitar reenvios
    return NextResponse.json({ received: true });
  }
}

// Mercado Pago também pode enviar GET para verificar endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook Mercado Pago ativo',
    timestamp: new Date().toISOString()
  });
}
