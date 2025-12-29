// Serviço de envio de e-mail usando Resend

import { Order } from './db';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'laysaarthur3209@gmail.com';

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
        from: 'Cantos de Memórias <onboarding@resend.dev>',
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
