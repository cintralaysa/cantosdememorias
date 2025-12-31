// Serviço de envio de e-mail usando Resend

import { Order } from './db';

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';
const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

export async function sendOrderNotification(order: Order): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY não configurada');
    return false;
  }

  const paymentMethodLabel = order.paymentMethod === 'card' ? 'Cartão de Crédito' :
                             order.paymentMethod === 'pix' ? 'PIX' : 'Não identificado';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7c3aed; }
        .section-title { font-weight: bold; color: #7c3aed; margin-bottom: 10px; }
        .lyrics { background: #fef3c7; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-style: italic; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .badge-card { background: #dbeafe; color: #1e40af; }
        .badge-pix { background: #d1fae5; color: #065f46; }
        .amount { font-size: 24px; font-weight: bold; color: #059669; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 Novo Pedido Recebido!</h1>
          <p>Cantos de Memórias</p>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">💰 Pagamento</div>
            <p class="amount">R$ ${order.amount.toFixed(2).replace('.', ',')}</p>
            <p>
              <span class="badge ${order.paymentMethod === 'card' ? 'badge-card' : 'badge-pix'}">
                ${paymentMethodLabel}
              </span>
            </p>
            <p><strong>ID do Pedido:</strong> ${order.id}</p>
            <p><strong>Data:</strong> ${new Date(order.createdAt).toLocaleString('pt-BR')}</p>
          </div>

          <div class="section">
            <div class="section-title">👤 Cliente</div>
            <p><strong>Nome:</strong> ${order.customerName}</p>
            <p><strong>E-mail:</strong> ${order.customerEmail}</p>
          </div>

          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <p><strong>Para quem:</strong> ${order.honoreeName} (${order.relationshipLabel})</p>
            <p><strong>Ocasião:</strong> ${order.occasionLabel}</p>
            <p><strong>Estilo Musical:</strong> ${order.musicStyleLabel}</p>
            <p><strong>Preferência de Voz:</strong> ${order.voicePreference === 'feminina' ? 'Feminina' : order.voicePreference === 'masculina' ? 'Masculina' : 'Sem preferência'}</p>
          </div>

          ${order.qualities ? `
          <div class="section">
            <div class="section-title">💝 Qualidades</div>
            <p>${order.qualities}</p>
          </div>
          ` : ''}

          ${order.memories ? `
          <div class="section">
            <div class="section-title">🎵 Memórias</div>
            <p>${order.memories}</p>
          </div>
          ` : ''}

          ${order.heartMessage ? `
          <div class="section">
            <div class="section-title">💌 Mensagem do Coração</div>
            <p>${order.heartMessage}</p>
          </div>
          ` : ''}

          ${order.familyNames ? `
          <div class="section">
            <div class="section-title">👨‍👩‍👧‍👦 Familiares para mencionar</div>
            <p>${order.familyNames}</p>
          </div>
          ` : ''}

          ${order.occasion === 'cha-revelacao' || order.occasion === 'cha-bebe' ? `
          <div class="section">
            <div class="section-title">🎀 Informações do Chá</div>
            ${order.knowsBabySex === 'sim' ? `
              <p><strong>Sexo:</strong> ${order.babySex === 'menino' ? '💙 Menino' : '💖 Menina'}</p>
              <p><strong>Nome do bebê:</strong> ${order.babySex === 'menino' ? order.babyNameBoy : order.babyNameGirl}</p>
            ` : `
              <p><strong>Os pais não sabem o sexo</strong></p>
              <p><strong>Nome se menino:</strong> ${order.babyNameBoy || 'Não informado'}</p>
              <p><strong>Nome se menina:</strong> ${order.babyNameGirl || 'Não informado'}</p>
            `}
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">📝 Letra Aprovada pelo Cliente</div>
            <div class="lyrics">${order.approvedLyrics}</div>
          </div>
        </div>

        <div class="footer">
          <p>Este e-mail foi enviado automaticamente pelo sistema Cantos de Memórias.</p>
          <p>Acesse o painel administrativo para mais detalhes.</p>
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
        from: 'Cantos de Memórias <contato@cantosdememorias.com.br>',
        to: [ADMIN_EMAIL],
        subject: `🎵 Novo Pedido #${order.id} - R$ ${order.amount.toFixed(2).replace('.', ',')} (${paymentMethodLabel})`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao enviar e-mail:', error);
      return false;
    }

    console.log('E-mail enviado com sucesso para', ADMIN_EMAIL);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return false;
  }
}

// E-mail de confirmação para o cliente
export async function sendCustomerConfirmation(order: Order): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY não configurada');
    return false;
  }

  if (!order.customerEmail) {
    console.error('E-mail do cliente não informado');
    return false;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0 0 10px 0; font-size: 28px; }
        .header p { margin: 0; opacity: 0.9; font-size: 16px; }
        .check-icon { width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .order-box { background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .order-row:last-child { border-bottom: none; }
        .order-label { color: #6b7280; }
        .order-value { font-weight: 600; color: #111827; }
        .highlight-box { background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
        .highlight-box h3 { color: #92400e; margin: 0 0 10px 0; }
        .highlight-box p { color: #78350f; margin: 0; }
        .steps { margin: 30px 0; }
        .step { display: flex; align-items: flex-start; margin-bottom: 15px; }
        .step-number { width: 30px; height: 30px; background: #7c3aed; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
        .step-content h4 { margin: 0 0 5px 0; color: #111827; }
        .step-content p { margin: 0; color: #6b7280; font-size: 14px; }
        .footer { text-align: center; padding: 30px; background: #f9fafb; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 14px; }
        .social-links { margin-top: 15px; }
        .social-links a { color: #7c3aed; text-decoration: none; margin: 0 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="check-icon">✓</div>
            <h1>Pedido Confirmado!</h1>
            <p>Sua música personalizada está a caminho</p>
          </div>

          <div class="content">
            <p class="greeting">Olá, <strong>${order.customerName || 'Cliente'}</strong>!</p>

            <p>Recebemos seu pedido e estamos muito felizes em criar essa música especial para você. Nossa equipe já está trabalhando com carinho para transformar sua história em uma canção emocionante.</p>

            <div class="order-box">
              <div class="order-row">
                <span class="order-label">Pedido</span>
                <span class="order-value">#${order.id}</span>
              </div>
              <div class="order-row">
                <span class="order-label">Para quem</span>
                <span class="order-value">${order.honoreeName}</span>
              </div>
              <div class="order-row">
                <span class="order-label">Ocasião</span>
                <span class="order-value">${order.occasionLabel}</span>
              </div>
              <div class="order-row">
                <span class="order-label">Estilo Musical</span>
                <span class="order-value">${order.musicStyleLabel}</span>
              </div>
              <div class="order-row">
                <span class="order-label">Valor</span>
                <span class="order-value" style="color: #059669;">R$ ${order.amount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div class="highlight-box">
              <h3>⏰ Prazo de Entrega</h3>
              <p><strong>Até 24 horas</strong> você receberá suas músicas!</p>
            </div>

            <div class="steps">
              <h3 style="margin-bottom: 20px;">Próximos Passos:</h3>

              <div class="step">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>Criação da Música</h4>
                  <p>Nossa equipe está criando sua música personalizada com base na letra que você aprovou.</p>
                </div>
              </div>

              <div class="step">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>Você Recebe 2 Versões</h4>
                  <p>Enviaremos 2 melodias diferentes para você escolher a que mais combina!</p>
                </div>
              </div>

              <div class="step">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>Entrega por WhatsApp</h4>
                  <p>Você receberá as músicas diretamente no seu WhatsApp em até 24 horas.</p>
                </div>
              </div>
            </div>

            <p style="text-align: center; color: #6b7280;">
              Alguma dúvida? Responda este e-mail ou entre em contato pelo Instagram!
            </p>
          </div>

          <div class="footer">
            <p><strong>Cantos de Memórias</strong></p>
            <p>Transformando sentimentos em música</p>
            <div class="social-links">
              <a href="https://instagram.com/cantosdememorias">@cantosdememorias</a>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
              Este é um e-mail automático. Por favor, não responda diretamente.
            </p>
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
        from: 'Cantos de Memórias <contato@cantosdememorias.com.br>',
        to: [order.customerEmail],
        subject: `✅ Pedido Confirmado! Sua música para ${order.honoreeName} está sendo criada`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erro ao enviar e-mail para cliente:', error);
      return false;
    }

    console.log('E-mail de confirmação enviado para', order.customerEmail);
    return true;
  } catch (error) {
    console.error('Erro ao enviar e-mail para cliente:', error);
    return false;
  }
}
