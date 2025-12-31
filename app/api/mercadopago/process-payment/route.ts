import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Token do Mercado Pago - Produção
const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-4063235147276146-122919-dd71f6ad2dc03550ecfc7e57767900a9-3101728620';

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
            <p class="amount">R$ ${(orderData.amount || 0).toFixed(2).replace('.', ',')}</p>
            <p><span class="badge">${paymentMethod === 'pix' ? '✓ PIX' : '✓ Cartão'}</span></p>
            <div class="info-row">
              <span class="info-label">ID do Pagamento:</span>
              <span class="info-value">${paymentId}</span>
            </div>
            <div class="info-row">
              <span class="info-label">ID do Pedido:</span>
              <span class="info-value">${orderData.orderId || 'N/A'}</span>
            </div>
          </div>

          <!-- Cliente -->
          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <div class="info-row">
              <span class="info-label">Nome:</span>
              <span class="info-value">${orderData.customerName || orderData.userName || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${orderData.customerEmail || orderData.email || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">WhatsApp:</span>
              <span class="info-value">${orderData.customerWhatsapp || orderData.whatsapp || 'N/A'}</span>
            </div>
            ${(orderData.customerWhatsapp || orderData.whatsapp) ? `<a href="https://wa.me/55${(orderData.customerWhatsapp || orderData.whatsapp).replace(/\D/g, '')}" class="whatsapp-btn">💬 Abrir WhatsApp</a>` : ''}
          </div>

          <!-- Detalhes do Pedido -->
          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <div class="info-row">
              <span class="info-label">Música para:</span>
              <span class="info-value">${orderData.honoreeName || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Relacionamento:</span>
              <span class="info-value">${orderData.relationshipLabel || orderData.relationship || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Ocasião:</span>
              <span class="info-value">${orderData.occasionLabel || orderData.occasion || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Estilo Musical:</span>
              <span class="info-value">${orderData.musicStyleLabel || orderData.musicStyle || 'N/A'}</span>
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

          ${(orderData.approvedLyrics || orderData.generatedLyrics) ? `
          <div class="section" style="border-left-color: #8b5cf6;">
            <div class="section-title">📝 LETRA APROVADA PELO CLIENTE</div>
            <div class="lyrics-box">${orderData.approvedLyrics || orderData.generatedLyrics}</div>
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
        from: 'Cantos de Memórias <contato@cantosdememorias.com.br>',
        to: [ADMIN_EMAIL],
        subject: `🎵 NOVO PEDIDO! ${orderData.honoreeName} - R$ ${(orderData.amount || 0).toFixed(2).replace('.', ',')} - ${orderData.occasionLabel || orderData.occasion || 'Música'}`,
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
  const customerEmail = orderData.customerEmail || orderData.email;

  if (!RESEND_API_KEY || !customerEmail) {
    return;
  }

  const customerName = orderData.customerName || orderData.userName || 'Cliente';

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
            <p>Olá, <strong>${customerName}</strong>!</p>
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
        from: 'Cantos de Memórias <contato@cantosdememorias.com.br>',
        to: [customerEmail],
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

    // Suporta tanto o formato antigo quanto o novo
    const paymentMethod = body.paymentMethod || body.paymentData?.payment_method_id;
    const amount = body.amount || body.orderData?.amount;
    const description = body.description || `Música Personalizada`;
    const payer = body.payer || {};
    const orderData = body.orderData || body;
    const token = body.token || body.paymentData?.token;
    const installments = body.installments || body.paymentData?.installments || 1;

    console.log('[PROCESS] Método de pagamento:', paymentMethod);
    console.log('[PROCESS] Valor:', amount);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }

    const paymentClient = new Payment(mercadopagoConfig);

    // Criar o corpo do pagamento
    const paymentBody: any = {
      transaction_amount: amount,
      description: description,
      payer: {
        email: payer.email || orderData.customerEmail || orderData.email,
        first_name: payer.first_name || (orderData.customerName || orderData.userName || '').split(' ')[0],
        last_name: payer.last_name || (orderData.customerName || orderData.userName || '').split(' ').slice(1).join(' ') || 'Cliente',
      },
      metadata: {
        order_id: orderData.orderId,
        customer_name: orderData.customerName || orderData.userName,
        customer_email: orderData.customerEmail || orderData.email,
        customer_whatsapp: orderData.customerWhatsapp || orderData.whatsapp,
        honoree_name: orderData.honoreeName,
        relationship: orderData.relationshipLabel || orderData.relationship,
        occasion: orderData.occasionLabel || orderData.occasion,
        music_style: orderData.musicStyleLabel || orderData.musicStyle,
        voice_preference: orderData.voicePreference,
        qualities: orderData.qualities,
        memories: orderData.memories,
        heart_message: orderData.heartMessage,
        family_names: orderData.familyNames,
        approved_lyrics: orderData.approvedLyrics || orderData.generatedLyrics,
        knows_baby_sex: orderData.knowsBabySex,
        baby_sex: orderData.babySex,
        baby_name_boy: orderData.babyNameBoy,
        baby_name_girl: orderData.babyNameGirl,
      },
    };

    // Configurar pagamento PIX
    if (paymentMethod === 'pix') {
      paymentBody.payment_method_id = 'pix';
    }
    // Configurar pagamento com cartão
    else if (paymentMethod === 'card' && token) {
      paymentBody.token = token;
      paymentBody.installments = installments;

      // Adicionar identificação do pagador se disponível
      if (payer.identification) {
        paymentBody.payer.identification = payer.identification;
      }
    }
    // Formato legado
    else if (body.paymentData?.payment_method_id) {
      paymentBody.payment_method_id = body.paymentData.payment_method_id;
      if (body.paymentData.token) {
        paymentBody.token = body.paymentData.token;
        paymentBody.installments = body.paymentData.installments || 1;
        paymentBody.issuer_id = body.paymentData.issuer_id;
      }
    }

    console.log('[PROCESS] Enviando pagamento para Mercado Pago...');
    console.log('[PROCESS] Payment body:', JSON.stringify(paymentBody, null, 2));

    const payment = await paymentClient.create({ body: paymentBody });

    console.log('[PROCESS] Resposta do pagamento:', payment.status);
    console.log('[PROCESS] Payment ID:', payment.id);
    console.log('[PROCESS] Status Detail:', payment.status_detail);

    // Determinar método de pagamento para o email
    let emailPaymentMethod = 'unknown';
    if (paymentMethod === 'pix' || paymentBody.payment_method_id === 'pix') {
      emailPaymentMethod = 'pix';
    } else if (token || paymentBody.token) {
      emailPaymentMethod = 'card';
    }

    // Se pagamento aprovado, enviar emails imediatamente
    if (payment.status === 'approved') {
      console.log('[PROCESS] ✅ Pagamento aprovado! Enviando emails...');
      await sendOrderEmail(orderData, String(payment.id), emailPaymentMethod);
      await sendCustomerEmail(orderData);
    }

    // Resposta para PIX (inclui QR code)
    if (payment.status === 'pending' && (paymentMethod === 'pix' || paymentBody.payment_method_id === 'pix')) {
      console.log('[PROCESS] PIX gerado, aguardando pagamento');
      return NextResponse.json({
        status: payment.status,
        statusDetail: payment.status_detail,
        paymentId: String(payment.id),
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
    console.error('[PROCESS] Erro detalhes:', JSON.stringify(error, null, 2));

    // Erros específicos do Mercado Pago
    if (error.cause && Array.isArray(error.cause)) {
      const mpError = error.cause[0];
      return NextResponse.json({
        error: mpError?.description || 'Erro ao processar pagamento',
        code: mpError?.code,
        statusDetail: mpError?.code,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: error.message || 'Erro ao processar pagamento',
    }, { status: 500 });
  }
}
