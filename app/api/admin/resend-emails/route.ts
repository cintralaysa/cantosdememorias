import { NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';

// Função para enviar email para ADMIN
async function sendAdminEmail(data: {
  orderId: string;
  amount: number;
  paymentMethod: string;
  order: any;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';
  const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

  const order = data.order;
  const voiceLabel = order.voicePreference === 'feminina' ? 'Feminina' :
                     order.voicePreference === 'masculina' ? 'Masculina' : 'Sem preferência';

  let babySection = '';
  if (order.occasion?.toLowerCase().includes('chá') || order.occasion?.toLowerCase().includes('cha') ||
      order.occasion?.toLowerCase().includes('revelação') || order.relationship === 'cha-revelacao') {
    babySection = `
      <div class="section" style="border-left-color: #ec4899;">
        <div class="section-title">👶 Informações do Bebê</div>
        ${order.knowsBabySex === 'sim' ? `
          <p><strong>Sexo do bebê:</strong> ${order.babySex === 'menino' ? '💙 Menino' : '💖 Menina'}</p>
          <p><strong>Nome escolhido:</strong> ${order.babySex === 'menino' ? order.babyNameBoy : order.babyNameGirl}</p>
        ` : `
          <p><strong>Os pais não sabem o sexo ainda</strong></p>
          <p><strong>Se for menino:</strong> ${order.babyNameBoy || 'Não informado'}</p>
          <p><strong>Se for menina:</strong> ${order.babyNameGirl || 'Não informado'}</p>
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
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .section-title { font-weight: bold; color: #059669; margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .amount { font-size: 36px; font-weight: bold; color: #059669; margin: 10px 0; }
        .badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; background: #d1fae5; color: #065f46; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 PEDIDO REENVIADO</h1>
          <p>Email reenviado manualmente</p>
        </div>
        <div class="content">
          <div class="section">
            <div class="section-title">💰 Pagamento Confirmado</div>
            <p class="amount">R$ ${data.amount.toFixed(2).replace('.', ',')}</p>
            <p><span class="badge">${data.paymentMethod === 'pix' ? '✓ PIX' : '✓ Cartão'}</span></p>
            <p><strong>ID do Pedido:</strong> ${data.orderId}</p>
          </div>
          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <p><strong>Nome:</strong> ${order.customerName || 'Não informado'}</p>
            <p><strong>Email:</strong> ${order.customerEmail || 'Não informado'}</p>
          </div>
          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <p><strong>Música para:</strong> ${order.honoreeName || 'Não informado'}</p>
            <p><strong>Relacionamento:</strong> ${order.relationshipLabel || order.relationship || 'Não informado'}</p>
            <p><strong>Ocasião:</strong> ${order.occasionLabel || order.occasion || 'Não informado'}</p>
            <p><strong>Estilo Musical:</strong> ${order.musicStyleLabel || order.musicStyle || 'Não informado'}</p>
            <p><strong>Preferência de Voz:</strong> ${voiceLabel}</p>
          </div>
          ${order.familyNames ? `<div class="section"><div class="section-title">👨‍👩‍👧‍👦 Familiares</div><p>${order.familyNames}</p></div>` : ''}
          ${order.qualities ? `<div class="section"><div class="section-title">💝 História/Qualidades</div><p>${order.qualities}</p></div>` : ''}
          ${order.memories ? `<div class="section"><div class="section-title">🎵 Memórias Especiais</div><p>${order.memories}</p></div>` : ''}
          ${order.heartMessage ? `<div class="section"><div class="section-title">💌 Mensagem do Coração</div><p>${order.heartMessage}</p></div>` : ''}
          ${babySection}
          ${order.approvedLyrics ? `<div class="section" style="border-left-color: #8b5cf6;"><div class="section-title">📝 LETRA APROVADA</div><div class="lyrics-box">${order.approvedLyrics}</div></div>` : ''}
        </div>
        <div class="footer">
          <p><strong>Cantos de Memórias</strong></p>
          <p>Email reenviado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
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
        subject: `🔄 REENVIADO: ${order.honoreeName || 'Cliente'} - R$ ${data.amount.toFixed(2).replace('.', ',')}`,
        html: htmlContent,
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function GET() {
  console.log('[RESEND] Buscando pedidos pagos recentes...');

  try {
    const orders = await getOrders();

    // Filtrar pedidos pagos dos últimos 2 dias
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const recentPaidOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return order.status === 'paid' && orderDate >= twoDaysAgo;
    });

    console.log('[RESEND] Pedidos encontrados:', recentPaidOrders.length);

    const results: any[] = [];

    for (const order of recentPaidOrders) {
      const emailResult = await sendAdminEmail({
        orderId: order.id,
        amount: order.amount || 0,
        paymentMethod: order.paymentMethod || 'unknown',
        order,
      });

      results.push({
        orderId: order.id,
        amount: order.amount,
        status: order.status,
        date: order.createdAt,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        honoreeName: order.honoreeName,
        emailSent: emailResult.success,
        emailError: emailResult.error,
      });

      // Pequeno delay entre emails
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      totalOrders: recentPaidOrders.length,
      results,
    });

  } catch (error) {
    console.error('[RESEND] Erro:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
