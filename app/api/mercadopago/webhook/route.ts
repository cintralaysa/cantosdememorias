import { NextResponse } from 'next/server';
import { getMercadoPagoPayment } from '@/lib/mercadopago';

// Interface para os dados do pedido do metadata
interface OrderMetadata {
  order_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_whatsapp?: string;
  honoree_name?: string;
  relationship?: string;
  occasion?: string;
  music_style?: string;
  voice_preference?: string;
  qualities?: string;
  memories?: string;
  heart_message?: string;
  family_names?: string;
  approved_lyrics?: string;
  knows_baby_sex?: string;
  baby_sex?: string;
  baby_name_boy?: string;
  baby_name_girl?: string;
}

// Função para enviar email completo com todos os dados do pedido
async function sendCompleteOrderEmail(paymentData: {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  metadata: OrderMetadata;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';
  const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

  if (!RESEND_API_KEY) {
    console.log('[WEBHOOK] RESEND_API_KEY não configurada, pulando email');
    return;
  }

  const meta = paymentData.metadata;
  const voiceLabel = meta.voice_preference === 'feminina' ? 'Feminina' :
                     meta.voice_preference === 'masculina' ? 'Masculina' : 'Sem preferência';

  // Seção de Chá Revelação (se aplicável)
  let babySection = '';
  if (meta.occasion?.toLowerCase().includes('chá') || meta.occasion?.toLowerCase().includes('cha') ||
      meta.occasion?.toLowerCase().includes('revelação') || meta.occasion?.toLowerCase().includes('bebe')) {
    babySection = `
      <div class="section" style="border-left-color: #ec4899;">
        <div class="section-title">👶 Informações do Bebê</div>
        ${meta.knows_baby_sex === 'sim' ? `
          <p><strong>Sexo do bebê:</strong> ${meta.baby_sex === 'menino' ? '💙 Menino' : '💖 Menina'}</p>
          <p><strong>Nome escolhido:</strong> ${meta.baby_sex === 'menino' ? meta.baby_name_boy : meta.baby_name_girl}</p>
        ` : `
          <p><strong>Os pais não sabem o sexo ainda</strong></p>
          <p><strong>Se for menino:</strong> ${meta.baby_name_boy || 'Não informado'}</p>
          <p><strong>Se for menina:</strong> ${meta.baby_name_girl || 'Não informado'}</p>
        `}
      </div>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .section-title { font-weight: bold; color: #059669; margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .amount { font-size: 36px; font-weight: bold; color: #059669; margin: 10px 0; }
        .badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; background: #d1fae5; color: #065f46; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; }
        .info-row { margin: 8px 0; }
        .info-label { color: #6b7280; font-size: 13px; }
        .info-value { font-weight: 600; color: #111827; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 NOVO PEDIDO PAGO!</h1>
          <p>Você recebeu um novo pedido de música personalizada</p>
        </div>

        <div class="content">
          <!-- Pagamento -->
          <div class="section">
            <div class="section-title">💰 Pagamento Confirmado</div>
            <p class="amount">R$ ${paymentData.amount.toFixed(2).replace('.', ',')}</p>
            <p><span class="badge">${paymentData.paymentMethod === 'pix' ? '✓ PIX' : '✓ Cartão'}</span></p>
            <div class="info-row">
              <span class="info-label">ID do Pagamento:</span>
              <span class="info-value">${paymentData.paymentId}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID do Pedido:</span>
              <span class="info-value">${meta.order_id || 'N/A'}</span>
            </div>
          </div>

          <!-- Cliente -->
          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <div class="info-row">
              <span class="info-label">Nome:</span>
              <span class="info-value">${meta.customer_name || 'Não informado'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${meta.customer_email || 'Não informado'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">WhatsApp:</span>
              <span class="info-value">${meta.customer_whatsapp || 'Não informado'}</span>
            </div>
            ${meta.customer_whatsapp ? `<a href="https://wa.me/55${meta.customer_whatsapp.replace(/\D/g, '')}" class="whatsapp-btn">💬 Abrir WhatsApp</a>` : ''}
          </div>

          <!-- Detalhes do Pedido -->
          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <div class="info-row">
              <span class="info-label">Música para:</span>
              <span class="info-value">${meta.honoree_name || 'Não informado'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Relacionamento:</span>
              <span class="info-value">${meta.relationship || 'Não informado'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ocasião:</span>
              <span class="info-value">${meta.occasion || 'Não informado'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estilo Musical:</span>
              <span class="info-value">${meta.music_style || 'Não informado'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Preferência de Voz:</span>
              <span class="info-value">${voiceLabel}</span>
            </div>
          </div>

          ${meta.family_names ? `
          <div class="section">
            <div class="section-title">👨‍👩‍👧‍👦 Familiares para Mencionar</div>
            <p>${meta.family_names}</p>
          </div>
          ` : ''}

          ${meta.qualities ? `
          <div class="section">
            <div class="section-title">💝 Qualidades do Homenageado</div>
            <p>${meta.qualities}</p>
          </div>
          ` : ''}

          ${meta.memories ? `
          <div class="section">
            <div class="section-title">🎵 Memórias Especiais</div>
            <p>${meta.memories}</p>
          </div>
          ` : ''}

          ${meta.heart_message ? `
          <div class="section">
            <div class="section-title">💌 Mensagem do Coração</div>
            <p>${meta.heart_message}</p>
          </div>
          ` : ''}

          ${babySection}

          ${meta.approved_lyrics ? `
          <div class="section" style="border-left-color: #8b5cf6;">
            <div class="section-title">📝 LETRA APROVADA PELO CLIENTE</div>
            <div class="lyrics-box">${meta.approved_lyrics}</div>
          </div>
          ` : ''}

        </div>

        <div class="footer">
          <p><strong>Cantos de Memórias</strong></p>
          <p>Este email foi enviado automaticamente quando o pagamento foi confirmado.</p>
          <p>Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
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
        subject: `🎵 NOVO PEDIDO! ${meta.honoree_name || 'Cliente'} - R$ ${paymentData.amount.toFixed(2).replace('.', ',')} - ${meta.occasion || 'Música'}`,
        html: htmlContent,
      }),
    });

    if (response.ok) {
      console.log('[WEBHOOK] ✅ Email completo enviado para', ADMIN_EMAIL);
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
      console.log('[WEBHOOK] Metadata:', JSON.stringify(payment.metadata, null, 2));

      const status = payment.status;
      const paymentMethodId = payment.payment_method_id;

      // Determinar método de pagamento
      let paymentMethod: 'card' | 'pix' | 'unknown' = 'unknown';
      if (paymentMethodId === 'pix') {
        paymentMethod = 'pix';
      } else if (['credit_card', 'debit_card', 'visa', 'master', 'amex', 'elo', 'hipercard'].includes(paymentMethodId || '')) {
        paymentMethod = 'card';
      }

      // Se o pagamento foi APROVADO, enviar email completo com todos os dados
      if (status === 'approved') {
        console.log('[WEBHOOK] ✅ PAGAMENTO APROVADO! Enviando email com dados completos...');

        // Pegar metadata do pagamento (contém todos os dados do pedido)
        const metadata = payment.metadata as OrderMetadata || {};

        await sendCompleteOrderEmail({
          paymentId: paymentId.toString(),
          amount: payment.transaction_amount || 0,
          paymentMethod,
          metadata,
        });
      }
    }

    console.log('[WEBHOOK] ========================================');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Erro:', error);
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
