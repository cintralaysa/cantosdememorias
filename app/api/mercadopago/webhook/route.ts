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

// Armazenar IDs de pagamentos já processados para evitar duplicatas (em memória)
// Em produção, isso deveria ser um Redis ou banco de dados
const processedPayments = new Set<string>();

// Função auxiliar para enviar email com retry
async function sendEmailWithRetry(
  emailFn: () => Promise<Response>,
  maxRetries: number = 3
): Promise<{ success: boolean; error?: string }> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await emailFn();
      if (response.ok) {
        const result = await response.json();
        return { success: true };
      }
      const error = await response.json();
      console.error(`[WEBHOOK] Tentativa ${attempt}/${maxRetries} falhou:`, error);

      // Esperar antes de tentar novamente (backoff exponencial)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        return { success: false, error: JSON.stringify(error) };
      }
    } catch (error) {
      console.error(`[WEBHOOK] Tentativa ${attempt}/${maxRetries} erro:`, error);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        return { success: false, error: String(error) };
      }
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

// Função para enviar email de confirmação para o CLIENTE
async function sendCustomerConfirmationEmail(paymentData: {
  amount: number;
  customerName: string;
  customerEmail: string;
  honoreeName: string;
  occasion: string;
}): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';

  if (!RESEND_API_KEY || !paymentData.customerEmail) {
    console.log('[WEBHOOK] Sem API key ou email do cliente, pulando email de confirmação');
    return false;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
        .header p { margin: 15px 0 0 0; opacity: 0.9; font-size: 16px; }
        .emoji-big { font-size: 60px; margin-bottom: 20px; }
        .content { padding: 40px 30px; }
        .success-badge { background: #10b981; color: white; display: inline-block; padding: 10px 25px; border-radius: 30px; font-weight: bold; font-size: 14px; margin-bottom: 25px; }
        .info-card { background: #f8f5ff; padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 4px solid #8b5cf6; }
        .info-card h3 { margin: 0 0 15px 0; color: #7c3aed; font-size: 16px; }
        .info-card p { margin: 8px 0; color: #555; }
        .timeline { margin: 30px 0; }
        .timeline-item { display: flex; align-items: flex-start; margin: 20px 0; }
        .timeline-icon { width: 40px; height: 40px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
        .timeline-content h4 { margin: 0 0 5px 0; color: #333; font-size: 15px; }
        .timeline-content p { margin: 0; color: #666; font-size: 14px; }
        .cta-section { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0; }
        .cta-section p { margin: 0; color: #92400e; font-weight: 600; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 13px; }
        .footer a { color: #8b5cf6; text-decoration: none; }
        .amount { font-size: 32px; font-weight: 800; color: #10b981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji-big">🎵</div>
          <h1>Pagamento Confirmado!</h1>
          <p>Obrigado por escolher a Cantos de Memórias</p>
        </div>

        <div class="content">
          <div style="text-align: center;">
            <span class="success-badge">✓ PAGAMENTO APROVADO</span>
            <p class="amount">R$ ${paymentData.amount.toFixed(2).replace('.', ',')}</p>
          </div>

          <p style="font-size: 18px; text-align: center; margin: 25px 0;">
            Olá, <strong>${paymentData.customerName || 'Cliente'}</strong>! 🎉
          </p>

          <p style="text-align: center; color: #555;">
            Recebemos seu pedido e já estamos trabalhando na sua música personalizada para <strong>${paymentData.honoreeName}</strong>.
          </p>

          <div class="info-card">
            <h3>📋 Resumo do seu pedido</h3>
            <p><strong>Música para:</strong> ${paymentData.honoreeName}</p>
            <p><strong>Ocasião:</strong> ${paymentData.occasion}</p>
            <p><strong>Valor pago:</strong> R$ ${paymentData.amount.toFixed(2).replace('.', ',')}</p>
          </div>

          <h3 style="color: #7c3aed; margin-top: 35px;">📅 Próximos passos:</h3>

          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-icon">1</div>
              <div class="timeline-content">
                <h4>Produção da sua música</h4>
                <p>Nossa equipe já está criando sua música exclusiva com todo carinho.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-icon">2</div>
              <div class="timeline-content">
                <h4>Contato via WhatsApp</h4>
                <p>Você receberá uma mensagem confirmando os detalhes.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-icon">3</div>
              <div class="timeline-content">
                <h4>Entrega em até 48 horas</h4>
                <p>Você receberá 2 melodias exclusivas no seu email e WhatsApp!</p>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <p>🎁 Você receberá: 1 letra exclusiva + 2 melodias diferentes!</p>
          </div>

        </div>

        <div class="footer">
          <p><strong>Cantos de Memórias</strong></p>
          <p>Eternizando momentos especiais em música</p>
          <p style="margin-top: 15px;">
            Dúvidas? Entre em contato: <a href="mailto:cantosdememorias@gmail.com">cantosdememorias@gmail.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmailWithRetry(() =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Cantos de Memórias <contato@cantosdememorias.com.br>',
        to: [paymentData.customerEmail],
        subject: `🎵 Pedido Confirmado! Sua música para ${paymentData.honoreeName} está sendo criada`,
        html: htmlContent,
      }),
    })
  );

  if (result.success) {
    console.log('[WEBHOOK] ✅ Email de confirmação enviado para cliente:', paymentData.customerEmail);
  } else {
    console.error('[WEBHOOK] ❌ Falha ao enviar email para cliente após 3 tentativas:', result.error);
  }

  return result.success;
}

// Função para enviar email completo com todos os dados do pedido (para ADMIN)
async function sendCompleteOrderEmail(paymentData: {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  metadata: OrderMetadata;
}): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';
  const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

  if (!RESEND_API_KEY) {
    console.log('[WEBHOOK] RESEND_API_KEY não configurada, pulando email');
    return false;
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

  const result = await sendEmailWithRetry(() =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Cantos de Memórias <contato@cantosdememorias.com.br>',
        to: [ADMIN_EMAIL],
        subject: `🎵 NOVO PEDIDO! ${meta.honoree_name || 'Cliente'} - R$ ${paymentData.amount.toFixed(2).replace('.', ',')} - ${meta.occasion || 'Música'}`,
        html: htmlContent,
      }),
    })
  );

  if (result.success) {
    console.log('[WEBHOOK] ✅ Email completo enviado para', ADMIN_EMAIL);
  } else {
    console.error('[WEBHOOK] ❌ Falha ao enviar email para admin após 3 tentativas:', result.error);
  }

  return result.success;
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

      // Verificar se já processamos este pagamento (evita duplicatas)
      const paymentKey = `payment_${paymentId}`;
      if (processedPayments.has(paymentKey)) {
        console.log('[WEBHOOK] Pagamento já processado, ignorando:', paymentId);
        return NextResponse.json({ received: true, already_processed: true });
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

      // Se o pagamento foi APROVADO, enviar emails
      if (status === 'approved') {
        console.log('[WEBHOOK] ✅ PAGAMENTO APROVADO! Enviando emails...');

        // Marcar como processado ANTES de enviar emails
        processedPayments.add(paymentKey);

        // Pegar metadata do pagamento (contém todos os dados do pedido)
        const metadata = payment.metadata as OrderMetadata || {};

        // 1. Enviar email para o ADMIN com todos os dados
        const adminEmailSent = await sendCompleteOrderEmail({
          paymentId: paymentId.toString(),
          amount: payment.transaction_amount || 0,
          paymentMethod,
          metadata,
        });

        // 2. Enviar email de confirmação para o CLIENTE
        let customerEmailSent = false;
        if (metadata.customer_email) {
          customerEmailSent = await sendCustomerConfirmationEmail({
            amount: payment.transaction_amount || 0,
            customerName: metadata.customer_name || '',
            customerEmail: metadata.customer_email,
            honoreeName: metadata.honoree_name || '',
            occasion: metadata.occasion || 'Música Personalizada',
          });
        }

        console.log('[WEBHOOK] Resultado: Admin email:', adminEmailSent ? '✅' : '❌', '| Cliente email:', customerEmailSent ? '✅' : '❌');
      }
    }

    console.log('[WEBHOOK] ========================================');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK] Erro:', error);
    // Mesmo com erro, retornamos 200 para o Mercado Pago não ficar tentando novamente
    return NextResponse.json({ received: true, error: String(error) });
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
