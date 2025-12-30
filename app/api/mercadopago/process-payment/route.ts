import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Token do Mercado Pago - Produção
const ACCESS_TOKEN = 'APP_USR-4063235147276146-122919-dd71f6ad2dc03550ecfc7e57767900a9-3101728620';

const mercadopagoConfig = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
  options: { timeout: 30000 }
});

// Função para enviar email com todos os dados do pedido
async function sendOrderEmail(orderData: any, paymentId: string, paymentMethod: string) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';
  const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

  if (!RESEND_API_KEY) {
    console.log('[PROCESS] RESEND_API_KEY não configurada');
    return;
  }

  const voiceLabel = orderData.voicePreference === 'feminina' ? 'Feminina' :
                     orderData.voicePreference === 'masculina' ? 'Masculina' : 'Sem preferência';

  // Seção de Chá Revelação (se aplicável)
  let babySection = '';
  if (orderData.occasion?.toLowerCase().includes('chá') || orderData.occasion?.toLowerCase().includes('cha') ||
      orderData.occasion?.toLowerCase().includes('revelação') || orderData.relationship === 'cha-revelacao') {
    babySection = `
      <div class="section" style="border-left-color: #ec4899;">
        <div class="section-title">👶 Informações do Bebê</div>
        ${orderData.knowsBabySex === 'sim' ? `
          <p><strong>Sexo do bebê:</strong> ${orderData.babySex === 'menino' ? '💙 Menino' : '💖 Menina'}</p>
          <p><strong>Nome escolhido:</strong> ${orderData.babySex === 'menino' ? orderData.babyNameBoy : orderData.babyNameGirl}</p>
        ` : `
          <p><strong>Os pais não sabem o sexo ainda</strong></p>
          <p><strong>Se for menino:</strong> ${orderData.babyNameBoy || 'Não informado'}</p>
          <p><strong>Se for menina:</strong> ${orderData.babyNameGirl || 'Não informado'}</p>
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
          <p>Checkout Transparente - Pagamento Confirmado</p>
        </div>

        <div class="content">
          <!-- Pagamento -->
          <div class="section">
            <div class="section-title">💰 Pagamento Confirmado</div>
            <p class="amount">R$ ${orderData.amount.toFixed(2).replace('.', ',')}</p>
            <p><span class="badge">${paymentMethod === 'pix' ? '✓ PIX' : '✓ Cartão'}</span></p>
            <div class="info-row">
              <span class="info-label">ID do Pagamento:</span>
              <span class="info-value">${paymentId}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID do Pedido:</span>
              <span class="info-value">${orderData.orderId}</span>
            </div>
          </div>

          <!-- Cliente -->
          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <div class="info-row">
              <span class="info-label">Nome:</span>
              <span class="info-value">${orderData.customerName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${orderData.customerEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-label">WhatsApp:</span>
              <span class="info-value">${orderData.customerWhatsapp}</span>
            </div>
            ${orderData.customerWhatsapp ? `<a href="https://wa.me/55${orderData.customerWhatsapp.replace(/\D/g, '')}" class="whatsapp-btn">💬 Abrir WhatsApp</a>` : ''}
          </div>

          <!-- Detalhes do Pedido -->
          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <div class="info-row">
              <span class="info-label">Música para:</span>
              <span class="info-value">${orderData.honoreeName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Relacionamento:</span>
              <span class="info-value">${orderData.relationshipLabel || orderData.relationship}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ocasião:</span>
              <span class="info-value">${orderData.occasionLabel || orderData.occasion}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estilo Musical:</span>
              <span class="info-value">${orderData.musicStyleLabel || orderData.musicStyle}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Preferência de Voz:</span>
              <span class="info-value">${voiceLabel}</span>
            </div>
          </div>

          ${orderData.familyNames ? `
          <div class="section">
            <div class="section-title">👨‍👩‍👧‍👦 Familiares para Mencionar</div>
            <p>${orderData.familyNames}</p>
          </div>
          ` : ''}

          ${orderData.qualities ? `
          <div class="section">
            <div class="section-title">💝 Qualidades do Homenageado</div>
            <p>${orderData.qualities}</p>
          </div>
          ` : ''}

          ${orderData.memories ? `
          <div class="section">
            <div class="section-title">🎵 Memórias Especiais</div>
            <p>${orderData.memories}</p>
          </div>
          ` : ''}

          ${orderData.heartMessage ? `
          <div class="section">
            <div class="section-title">💌 Mensagem do Coração</div>
            <p>${orderData.heartMessage}</p>
          </div>
          ` : ''}

          ${babySection}

          ${orderData.approvedLyrics ? `
          <div class="section" style="border-left-color: #8b5cf6;">
            <div class="section-title">📝 LETRA APROVADA PELO CLIENTE</div>
            <div class="lyrics-box">${orderData.approvedLyrics}</div>
          </div>
          ` : ''}

        </div>

        <div class="footer">
          <p><strong>Cantos de Memórias</strong></p>
          <p>Checkout Transparente - Pagamento processado diretamente no site</p>
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
        subject: `🎵 NOVO PEDIDO! ${orderData.honoreeName} - R$ ${orderData.amount.toFixed(2).replace('.', ',')} - ${orderData.occasionLabel || orderData.occasion}`,
        html: htmlContent,
      }),
    });

    if (response.ok) {
      console.log('[PROCESS] ✅ Email enviado para', ADMIN_EMAIL);
    } else {
      const error = await response.json();
      console.error('[PROCESS] Erro ao enviar email:', error);
    }
  } catch (error) {
    console.error('[PROCESS] Erro ao enviar email:', error);
  }
}

// Função para enviar email de confirmação para o cliente
async function sendCustomerEmail(orderData: any) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';

  if (!RESEND_API_KEY || !orderData.customerEmail) {
    return;
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
        .check-icon { width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 40px; }
        .content { padding: 30px; }
        .highlight-box { background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; padding: 30px; background: #f9fafb; }
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
            <p>Olá, <strong>${orderData.customerName}</strong>!</p>
            <p>Recebemos seu pedido e estamos muito felizes em criar essa música especial para <strong>${orderData.honoreeName}</strong>.</p>

            <div class="highlight-box">
              <h3 style="margin: 0 0 10px 0; color: #92400e;">⏰ Prazo de Entrega</h3>
              <p style="margin: 0; color: #78350f;"><strong>Até 24 horas</strong> você receberá suas músicas no WhatsApp!</p>
            </div>

            <p><strong>O que você vai receber:</strong></p>
            <ul>
              <li>2 melodias diferentes da mesma letra</li>
              <li>Arquivos em alta qualidade</li>
              <li>Entrega direto no seu WhatsApp</li>
            </ul>
          </div>

          <div class="footer">
            <p><strong>Cantos de Memórias</strong></p>
            <p>Transformando sentimentos em música</p>
            <p style="font-size: 12px; color: #9ca3af;">@cantosdememorias</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Cantos de Memórias <onboarding@resend.dev>',
        to: [orderData.customerEmail],
        subject: `✅ Pedido Confirmado! Sua música para ${orderData.honoreeName} está sendo criada`,
        html: htmlContent,
      }),
    });
    console.log('[PROCESS] Email de confirmação enviado para cliente');
  } catch (error) {
    console.error('[PROCESS] Erro ao enviar email para cliente:', error);
  }
}

export async function POST(req: Request) {
  console.log('[PROCESS] ========================================');
  console.log('[PROCESS] Processando pagamento transparente');

  try {
    const body = await req.json();
    const { paymentData, orderData } = body;

    console.log('[PROCESS] Dados do pagamento recebidos');
    console.log('[PROCESS] Método:', paymentData.payment_method_id);
    console.log('[PROCESS] Valor:', orderData.amount);

    const paymentClient = new Payment(mercadopagoConfig);

    // Criar o pagamento
    const paymentBody: any = {
      transaction_amount: orderData.amount,
      description: `Música Personalizada para ${orderData.honoreeName}`,
      payment_method_id: paymentData.payment_method_id,
      payer: {
        email: orderData.customerEmail,
        first_name: orderData.customerName.split(' ')[0],
        last_name: orderData.customerName.split(' ').slice(1).join(' ') || orderData.customerName,
      },
      metadata: {
        order_id: orderData.orderId,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_whatsapp: orderData.customerWhatsapp,
        honoree_name: orderData.honoreeName,
      },
    };

    // Para cartão de crédito
    if (paymentData.token) {
      paymentBody.token = paymentData.token;
      paymentBody.installments = paymentData.installments || 1;
      paymentBody.issuer_id = paymentData.issuer_id;
    }

    console.log('[PROCESS] Enviando pagamento para Mercado Pago...');

    const payment = await paymentClient.create({ body: paymentBody });

    console.log('[PROCESS] Resposta do pagamento:', payment.status);
    console.log('[PROCESS] Payment ID:', payment.id);

    // Se pagamento aprovado ou pendente (PIX), enviar emails
    if (payment.status === 'approved' || payment.status === 'pending' || payment.status === 'in_process') {
      // Determinar método de pagamento
      let paymentMethod = 'unknown';
      if (paymentData.payment_method_id === 'pix') {
        paymentMethod = 'pix';
      } else if (['credit_card', 'debit_card', 'visa', 'master', 'amex', 'elo', 'hipercard'].includes(paymentData.payment_method_id)) {
        paymentMethod = 'card';
      }

      // Enviar email para admin
      await sendOrderEmail(orderData, String(payment.id), paymentMethod);

      // Enviar email de confirmação para cliente
      await sendCustomerEmail(orderData);
    }

    // Resposta para PIX (inclui QR code)
    if (payment.status === 'pending' && paymentData.payment_method_id === 'pix') {
      return NextResponse.json({
        status: payment.status,
        statusDetail: payment.status_detail,
        paymentId: String(payment.id),
        // Dados do PIX
        pixQrCode: payment.point_of_interaction?.transaction_data?.qr_code,
        pixQrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
        pixExpirationDate: payment.date_of_expiration,
      });
    }

    return NextResponse.json({
      status: payment.status,
      statusDetail: payment.status_detail,
      paymentId: String(payment.id),
    });

  } catch (error: any) {
    console.error('[PROCESS] Erro:', error);

    // Erros específicos do Mercado Pago
    if (error.cause) {
      const mpError = error.cause[0];
      return NextResponse.json({
        error: mpError?.description || 'Erro ao processar pagamento',
        code: mpError?.code,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: error.message || 'Erro ao processar pagamento',
    }, { status: 500 });
  }
}
