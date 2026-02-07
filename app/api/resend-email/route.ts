import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/db';

// API para reenviar emails de um pedido específico
export async function POST(req: Request) {
  console.log('[RESEND-EMAIL] Recebendo requisição para reenviar email');

  try {
    const body = await req.json();
    const { orderId, type } = body; // type: 'admin' | 'customer' | 'both'

    if (!orderId) {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
    }

    console.log('[RESEND-EMAIL] Order ID:', orderId, '| Tipo:', type || 'both');

    // Buscar dados do pedido no banco
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';
    const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

    const results: { admin?: boolean; customer?: boolean } = {};

    // Enviar email para admin
    if (!type || type === 'admin' || type === 'both') {
      const voiceLabel = order.voicePreference === 'feminina' ? 'Feminina' :
                         order.voicePreference === 'masculina' ? 'Masculina' : 'Sem preferência';

      let babySection = '';
      if (order.occasion?.toLowerCase().includes('chá') || order.occasion?.toLowerCase().includes('revelação')) {
        babySection = `
          <div class="section" style="border-left-color: #ec4899;">
            <div class="section-title">👶 Informações do Bebê</div>
            ${order.knowsBabySex === 'sim' ? `
              <p><strong>Sexo:</strong> ${order.babySex === 'menino' ? '💙 Menino' : '💖 Menina'}</p>
              <p><strong>Nome:</strong> ${order.babySex === 'menino' ? order.babyNameBoy : order.babyNameGirl}</p>
            ` : `
              <p><strong>Se menino:</strong> ${order.babyNameBoy || 'N/A'}</p>
              <p><strong>Se menina:</strong> ${order.babyNameGirl || 'N/A'}</p>
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
                <p class="amount">R$ ${(order.amount || 0).toFixed(2).replace('.', ',')}</p>
                <p><span class="badge">⚡ REENVIADO</span></p>
                <div><span style="color:#6b7280;font-size:13px">ID:</span> <span style="font-weight:600">${orderId}</span></div>
              </div>
              <div class="section">
                <div class="section-title">👤 Cliente</div>
                <p><strong>Nome:</strong> ${order.customerName || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
              </div>
              <div class="section">
                <div class="section-title">🎁 Pedido</div>
                <p><strong>Música para:</strong> ${order.honoreeName || 'N/A'}</p>
                <p><strong>Relacionamento:</strong> ${order.relationshipLabel || order.relationship || 'N/A'}</p>
                <p><strong>Ocasião:</strong> ${order.occasionLabel || order.occasion || 'N/A'}</p>
                <p><strong>Estilo:</strong> ${order.musicStyleLabel || order.musicStyle || 'N/A'}</p>
                <p><strong>Voz:</strong> ${voiceLabel}</p>
              </div>
              ${order.familyNames ? `<div class="section"><div class="section-title">👨‍👩‍👧‍👦 Familiares</div><p>${order.familyNames}</p></div>` : ''}
              ${order.qualities ? `<div class="section"><div class="section-title">💝 Qualidades</div><p>${order.qualities}</p></div>` : ''}
              ${order.memories ? `<div class="section"><div class="section-title">🎵 Memórias</div><p>${order.memories}</p></div>` : ''}
              ${order.heartMessage ? `<div class="section"><div class="section-title">💌 Mensagem</div><p>${order.heartMessage}</p></div>` : ''}
              ${babySection}
              ${order.approvedLyrics ? `<div class="section" style="border-left-color: #8b5cf6;"><div class="section-title">📝 LETRA APROVADA</div><div class="lyrics-box">${order.approvedLyrics}</div></div>` : ''}
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
            subject: `🔄 REENVIADO: ${order.honoreeName || 'Cliente'} - R$ ${(order.amount || 0).toFixed(2).replace('.', ',')}`,
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
    if ((!type || type === 'customer' || type === 'both') && order.customerEmail) {
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
                <p class="amount">R$ ${(order.amount || 0).toFixed(2).replace('.', ',')}</p>
              </div>
              <p style="font-size: 18px; text-align: center; margin: 25px 0;">
                Olá, <strong>${order.customerName || 'Cliente'}</strong>! 🎉
              </p>
              <p style="text-align: center; color: #555;">
                Recebemos seu pedido e já estamos trabalhando na sua música personalizada para <strong>${order.honoreeName}</strong>.
              </p>
              <div class="info-card">
                <h3 style="margin: 0 0 15px 0; color: #7c3aed;">📋 Resumo do seu pedido</h3>
                <p><strong>Música para:</strong> ${order.honoreeName}</p>
                <p><strong>Ocasião:</strong> ${order.occasionLabel || order.occasion}</p>
                <p><strong>Valor pago:</strong> R$ ${(order.amount || 0).toFixed(2).replace('.', ',')}</p>
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
            to: [order.customerEmail],
            subject: `🎵 Pedido Confirmado! Sua música para ${order.honoreeName} está sendo criada`,
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
      orderId,
      results,
      order: {
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        honoreeName: order.honoreeName,
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
    usage: 'POST com { orderId: "ORD-xxx", type: "admin" | "customer" | "both" }',
    timestamp: new Date().toISOString()
  });
}
