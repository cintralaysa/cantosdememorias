import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-4063235147276146-122919-dd71f6ad2dc03550ecfc7e57767900a9-3101728620';

const mercadopagoConfig = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
  options: { timeout: 30000 }
});

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

// Função para enviar email para ADMIN
async function sendAdminEmail(data: {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  metadata: OrderMetadata;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';
  const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

  const meta = data.metadata;
  const voiceLabel = meta.voice_preference === 'feminina' ? 'Feminina' :
                     meta.voice_preference === 'masculina' ? 'Masculina' : 'Sem preferência';

  let babySection = '';
  if (meta.occasion?.toLowerCase().includes('chá') || meta.occasion?.toLowerCase().includes('cha') ||
      meta.occasion?.toLowerCase().includes('revelação') || meta.relationship === 'cha-revelacao') {
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
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .resent-badge { background: #fbbf24; color: #78350f; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 PEDIDO REENVIADO</h1>
          <p><span class="resent-badge">⚡ Email reenviado manualmente</span></p>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">💰 Pagamento Confirmado</div>
            <p class="amount">R$ ${data.amount.toFixed(2).replace('.', ',')}</p>
            <p><span class="badge">${data.paymentMethod === 'pix' ? '✓ PIX' : '✓ Cartão'}</span></p>
            <p><strong>ID do Pagamento:</strong> ${data.paymentId}</p>
            <p><strong>ID do Pedido:</strong> ${meta.order_id || 'N/A'}</p>
          </div>

          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <p><strong>Nome:</strong> ${meta.customer_name || 'Não informado'}</p>
            <p><strong>Email:</strong> ${meta.customer_email || 'Não informado'}</p>
            <p><strong>WhatsApp:</strong> ${meta.customer_whatsapp || 'Não informado'}</p>
            ${meta.customer_whatsapp ? `<a href="https://wa.me/55${meta.customer_whatsapp.replace(/\D/g, '')}" class="whatsapp-btn">💬 Abrir WhatsApp</a>` : ''}
          </div>

          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <p><strong>Música para:</strong> ${meta.honoree_name || 'Não informado'}</p>
            <p><strong>Relacionamento:</strong> ${meta.relationship || 'Não informado'}</p>
            <p><strong>Ocasião:</strong> ${meta.occasion || 'Não informado'}</p>
            <p><strong>Estilo Musical:</strong> ${meta.music_style || 'Não informado'}</p>
            <p><strong>Preferência de Voz:</strong> ${voiceLabel}</p>
          </div>

          ${meta.family_names ? `
          <div class="section">
            <div class="section-title">👨‍👩‍👧‍👦 Familiares para Mencionar</div>
            <p>${meta.family_names}</p>
          </div>
          ` : ''}

          ${meta.qualities ? `
          <div class="section">
            <div class="section-title">💝 História/Qualidades</div>
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
        subject: `🔄 REENVIADO: ${meta.honoree_name || 'Cliente'} - R$ ${data.amount.toFixed(2).replace('.', ',')}`,
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
  console.log('[RESEND] Buscando pagamentos aprovados de hoje...');

  try {
    // Buscar pagamentos dos últimos 2 dias para garantir
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const paymentClient = new Payment(mercadopagoConfig);

    // Buscar pagamentos aprovados usando a API de search
    const searchResult = await fetch(
      `https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&range=date_created&begin_date=${twoDaysAgo.toISOString().split('T')[0]}T00:00:00Z&end_date=${today.toISOString().split('T')[0]}T23:59:59Z&status=approved`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    const searchData = await searchResult.json();
    console.log('[RESEND] Pagamentos encontrados:', searchData.results?.length || 0);

    const payments = searchData.results || [];
    const results: any[] = [];

    for (const payment of payments) {
      const metadata = (payment.metadata || {}) as OrderMetadata;
      const paymentMethod = payment.payment_method_id === 'pix' ? 'pix' : 'card';

      // Enviar email
      const emailResult = await sendAdminEmail({
        paymentId: String(payment.id),
        amount: payment.transaction_amount || 0,
        paymentMethod,
        metadata,
      });

      results.push({
        paymentId: payment.id,
        amount: payment.transaction_amount,
        status: payment.status,
        date: payment.date_created,
        customerName: metadata.customer_name,
        customerEmail: metadata.customer_email,
        honoreeName: metadata.honoree_name,
        emailSent: emailResult.success,
        emailError: emailResult.error,
      });

      // Pequeno delay entre emails para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      success: true,
      totalPayments: payments.length,
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
