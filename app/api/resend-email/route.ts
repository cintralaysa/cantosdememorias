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

// API para reenviar emails de um pagamento específico
// Útil quando o webhook falha ou para reenviar manualmente
export async function POST(req: Request) {
  console.log('[RESEND-EMAIL] Recebendo requisição para reenviar email');

  try {
    const body = await req.json();
    const { paymentId, type } = body; // type: 'admin' | 'customer' | 'both'

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId é obrigatório' }, { status: 400 });
    }

    console.log('[RESEND-EMAIL] Payment ID:', paymentId, '| Tipo:', type || 'both');

    // Buscar dados do pagamento no Mercado Pago
    const payment = await getMercadoPagoPayment(Number(paymentId));

    if (payment.status !== 'approved') {
      return NextResponse.json({
        error: 'Pagamento não está aprovado',
        status: payment.status
      }, { status: 400 });
    }

    const metadata = payment.metadata as OrderMetadata || {};
    const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';
    const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

    const results: { admin?: boolean; customer?: boolean } = {};

    // Determinar método de pagamento
    const paymentMethodId = payment.payment_method_id;
    let paymentMethod = 'unknown';
    if (paymentMethodId === 'pix') {
      paymentMethod = 'pix';
    } else if (['credit_card', 'debit_card', 'visa', 'master', 'amex', 'elo', 'hipercard'].includes(paymentMethodId || '')) {
      paymentMethod = 'card';
    }

    // Enviar email para admin
    if (!type || type === 'admin' || type === 'both') {
      const voiceLabel = metadata.voice_preference === 'feminina' ? 'Feminina' :
                         metadata.voice_preference === 'masculina' ? 'Masculina' : 'Sem preferência';

      let babySection = '';
      if (metadata.occasion?.toLowerCase().includes('chá') || metadata.occasion?.toLowerCase().includes('revelação')) {
        babySection = `
          <div class="section" style="border-left-color: #ec4899;">
            <div class="section-title">👶 Informações do Bebê</div>
            ${metadata.knows_baby_sex === 'sim' ? `
              <p><strong>Sexo:</strong> ${metadata.baby_sex === 'menino' ? '💙 Menino' : '💖 Menina'}</p>
              <p><strong>Nome:</strong> ${metadata.baby_sex === 'menino' ? metadata.baby_name_boy : metadata.baby_name_girl}</p>
            ` : `
              <p><strong>Se menino:</strong> ${metadata.baby_name_boy || 'N/A'}</p>
              <p><strong>Se menina:</strong> ${metadata.baby_name_girl || 'N/A'}</p>
            `}
          </div>
        `;
      }

      const adminHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
            .section-title { font-weight: bold; color: #059669; margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
            .amount { font-size: 36px; font-weight: bold; color: #059669; }
            .badge { display: inline-block; padding: 8px 20px; border-radius: 20px; background: #fef3c7; color: #92400e; font-weight: bold; }
            .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; }
            .info-row { margin: 8px 0; }
            .info-label { color: #6b7280; font-size: 13px; }
            .info-value { font-weight: 600; color: #111827; }
            .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎵 PEDIDO REENVIADO</h1>
              <p>Este email foi reenviado manualmente</p>
            </div>
            <div class="content">
              <div class="section">
                <div class="section-title">💰 Pagamento</div>
                <p class="amount">R$ ${(payment.transaction_amount || 0).toFixed(2).replace('.', ',')}</p>
                <p><span class="badge">⚡ REENVIADO</span></p>
                <div class="info-row">
                  <span class="info-label">ID:</span>
                  <span class="info-value">${paymentId}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">👤 Cliente</div>
                <div class="info-row">
                  <span class="info-label">Nome:</span>
                  <span class="info-value">${metadata.customer_name || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${metadata.customer_email || 'N/A'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">WhatsApp:</span>
                  <span class="info-value">${metadata.customer_whatsapp || 'N/A'}</span>
                </div>
                ${metadata.customer_whatsapp ? `<a href="https://wa.me/55${metadata.customer_whatsapp.replace(/\D/g, '')}" class="whatsapp-btn">💬 Abrir WhatsApp</a>` : ''}
              </div>

              <div class="section">
                <div class="section-title">🎁 Pedido</div>
                <div class="info-row"><span class="info-label">Música para:</span> <span class="info-value">${metadata.honoree_name || 'N/A'}</span></div>
                <div class="info-row"><span class="info-label">Relacionamento:</span> <span class="info-value">${metadata.relationship || 'N/A'}</span></div>
                <div class="info-row"><span class="info-label">Ocasião:</span> <span class="info-value">${metadata.occasion || 'N/A'}</span></div>
                <div class="info-row"><span class="info-label">Estilo:</span> <span class="info-value">${metadata.music_style || 'N/A'}</span></div>
                <div class="info-row"><span class="info-label">Voz:</span> <span class="info-value">${voiceLabel}</span></div>
              </div>

              ${metadata.family_names ? `<div class="section"><div class="section-title">👨‍👩‍👧‍👦 Familiares</div><p>${metadata.family_names}</p></div>` : ''}
              ${metadata.qualities ? `<div class="section"><div class="section-title">💝 Qualidades</div><p>${metadata.qualities}</p></div>` : ''}
              ${metadata.memories ? `<div class="section"><div class="section-title">🎵 Memórias</div><p>${metadata.memories}</p></div>` : ''}
              ${metadata.heart_message ? `<div class="section"><div class="section-title">💌 Mensagem</div><p>${metadata.heart_message}</p></div>` : ''}
              ${babySection}
              ${metadata.approved_lyrics ? `<div class="section" style="border-left-color: #8b5cf6;"><div class="section-title">📝 LETRA APROVADA</div><div class="lyrics-box">${metadata.approved_lyrics}</div></div>` : ''}
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const adminResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Cantos de Memórias <contato@cantosdememorias.com.br>',
            to: [ADMIN_EMAIL],
            subject: `🔄 REENVIADO: ${metadata.honoree_name || 'Cliente'} - R$ ${(payment.transaction_amount || 0).toFixed(2).replace('.', ',')}`,
            html: adminHtml,
          }),
        });
        results.admin = adminResponse.ok;
        console.log('[RESEND-EMAIL] Email admin:', results.admin ? '✅' : '❌');
      } catch (error) {
        console.error('[RESEND-EMAIL] Erro email admin:', error);
        results.admin = false;
      }
    }

    // Enviar email para cliente
    if ((!type || type === 'customer' || type === 'both') && metadata.customer_email) {
      const customerHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
            .content { padding: 40px 30px; }
            .success-badge { background: #10b981; color: white; display: inline-block; padding: 10px 25px; border-radius: 30px; font-weight: bold; }
            .info-card { background: #f8f5ff; padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 4px solid #8b5cf6; }
            .amount { font-size: 32px; font-weight: 800; color: #10b981; }
            .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer p { margin: 5px 0; color: #6b7280; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 60px; margin-bottom: 20px;">🎵</div>
              <h1>Pagamento Confirmado!</h1>
              <p style="opacity: 0.9;">Obrigado por escolher a Cantos de Memórias</p>
            </div>
            <div class="content">
              <div style="text-align: center;">
                <span class="success-badge">✓ PAGAMENTO APROVADO</span>
                <p class="amount">R$ ${(payment.transaction_amount || 0).toFixed(2).replace('.', ',')}</p>
              </div>
              <p style="font-size: 18px; text-align: center; margin: 25px 0;">
                Olá, <strong>${metadata.customer_name || 'Cliente'}</strong>! 🎉
              </p>
              <p style="text-align: center; color: #555;">
                Recebemos seu pedido e já estamos trabalhando na sua música personalizada para <strong>${metadata.honoree_name}</strong>.
              </p>
              <div class="info-card">
                <h3 style="margin: 0 0 15px 0; color: #7c3aed;">📋 Resumo do seu pedido</h3>
                <p><strong>Música para:</strong> ${metadata.honoree_name}</p>
                <p><strong>Ocasião:</strong> ${metadata.occasion}</p>
                <p><strong>Valor pago:</strong> R$ ${(payment.transaction_amount || 0).toFixed(2).replace('.', ',')}</p>
              </div>
              <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; border-radius: 15px; text-align: center;">
                <p style="margin: 0; color: #92400e; font-weight: 600;">🎁 Você receberá: 1 letra exclusiva + 2 melodias diferentes!</p>
              </div>
            </div>
            <div class="footer">
              <p><strong>Cantos de Memórias</strong></p>
              <p>Eternizando momentos especiais em música</p>
              <p>Dúvidas? <a href="mailto:cantosdememorias@gmail.com" style="color: #8b5cf6;">cantosdememorias@gmail.com</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const customerResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Cantos de Memórias <contato@cantosdememorias.com.br>',
            to: [metadata.customer_email],
            subject: `🎵 Pedido Confirmado! Sua música para ${metadata.honoree_name} está sendo criada`,
            html: customerHtml,
          }),
        });
        results.customer = customerResponse.ok;
        console.log('[RESEND-EMAIL] Email cliente:', results.customer ? '✅' : '❌');
      } catch (error) {
        console.error('[RESEND-EMAIL] Erro email cliente:', error);
        results.customer = false;
      }
    }

    return NextResponse.json({
      success: true,
      paymentId,
      results,
      metadata: {
        customer_name: metadata.customer_name,
        customer_email: metadata.customer_email,
        honoree_name: metadata.honoree_name,
      }
    });
  } catch (error) {
    console.error('[RESEND-EMAIL] Erro:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// GET para verificar status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'API de reenvio de emails ativa',
    usage: 'POST com { paymentId: "123", type: "admin" | "customer" | "both" }',
    timestamp: new Date().toISOString()
  });
}
