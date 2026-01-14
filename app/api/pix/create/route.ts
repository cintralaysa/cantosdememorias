import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cantos de Memórias <onboarding@resend.dev>';
const OPENPIX_APP_ID = process.env.OPENPIX_APP_ID;

// Preço da música em centavos (R$ 79,99 = 7999)
const PRECO_MUSICA = 7999;

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Gerar ID único do pedido
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const correlationID = orderId;

    if (!OPENPIX_APP_ID) {
      console.error('OPENPIX_APP_ID não configurado');
      return NextResponse.json(
        { error: 'Gateway de pagamento não configurado' },
        { status: 500 }
      );
    }

    // Criar cobrança PIX na OpenPix
    const pixResponse = await fetch('https://api.openpix.com.br/api/v1/charge', {
      method: 'POST',
      headers: {
        'Authorization': OPENPIX_APP_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correlationID,
        value: PRECO_MUSICA,
        comment: `Música personalizada para ${orderData.honoreeName || 'presente'}`,
        customer: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          phone: orderData.customerWhatsapp?.replace(/\D/g, ''),
        },
        additionalInfo: [
          { key: 'Homenageado', value: orderData.honoreeName || '' },
          { key: 'Ocasião', value: orderData.occasionLabel || orderData.occasion || '' },
          { key: 'Estilo', value: orderData.musicStyleLabel || orderData.musicStyle || '' },
        ],
        expiresIn: 3600, // 1 hora para pagar
      }),
    });

    if (!pixResponse.ok) {
      const errorData = await pixResponse.text();
      console.error('Erro OpenPix:', errorData);
      return NextResponse.json(
        { error: 'Erro ao gerar PIX' },
        { status: 500 }
      );
    }

    const pixData = await pixResponse.json();

    console.log('=== PIX GERADO ===');
    console.log('Order ID:', orderId);
    console.log('Correlation ID:', correlationID);
    console.log('QR Code gerado com sucesso');

    // Enviar email para admin com dados do pedido (AGUARDANDO PAGAMENTO)
    await sendOrderEmail(orderData, orderId, 'pending');

    // Enviar email de confirmação para o cliente
    if (orderData.customerEmail) {
      await sendCustomerConfirmationEmail(orderData, orderId);
    }

    return NextResponse.json({
      success: true,
      orderId,
      correlationID,
      pixData: {
        qrCode: pixData.charge?.qrCodeImage || pixData.qrCodeImage,
        qrCodeBase64: pixData.charge?.qrCodeImage || pixData.qrCodeImage,
        pixCopiaECola: pixData.charge?.brCode || pixData.brCode,
        expiresAt: pixData.charge?.expiresAt || pixData.expiresAt,
        value: PRECO_MUSICA,
        valueFormatted: 'R$ 79,99',
      },
    });
  } catch (error) {
    console.error('Erro ao criar PIX:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}

async function sendOrderEmail(orderData: any, orderId: string, status: 'pending' | 'paid') {
  const isPending = status === 'pending';
  const lyricsHtml = orderData.generatedLyrics ? orderData.generatedLyrics.replace(/\n/g, '<br>') : '';
  const isChaRevelacao = orderData.relationship === 'cha-revelacao' || orderData.occasion === 'cha-revelacao';
  const whatsappClean = (orderData.customerWhatsapp || '').replace(/\D/g, '');
  const whatsappLink = whatsappClean ? `https://wa.me/55${whatsappClean}` : '#';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, ${isPending ? '#f59e0b, #d97706' : '#10b981, #059669'}); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .badge { display: inline-block; background: ${isPending ? '#fef3c7' : '#d1fae5'}; color: ${isPending ? '#92400e' : '#065f46'}; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid ${isPending ? '#f59e0b' : '#10b981'}; }
        .section-purple { border-left-color: #8b5cf6; }
        .section-pink { border-left-color: #ec4899; }
        .section-title { font-weight: bold; color: ${isPending ? '#d97706' : '#059669'}; margin-bottom: 15px; font-size: 16px; }
        .info-row { margin: 8px 0; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; white-space: pre-wrap; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
        .baby-box { background: linear-gradient(135deg, #fce7f3, #dbeafe); padding: 15px; border-radius: 8px; margin: 10px 0; }
        .warning-box { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 ${isPending ? 'NOVO PEDIDO - AGUARDANDO PIX' : 'PIX CONFIRMADO'}</h1>
          <div class="badge">${isPending ? '⏳ Aguardando pagamento PIX' : '✅ Pagamento confirmado'}</div>
        </div>

        <div class="content">
          ${isPending ? `
          <div class="warning-box">
            <strong>⏳ AGUARDANDO PIX:</strong> O cliente está com o QR Code aberto. Você receberá outro email quando o pagamento for confirmado.
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">📋 ID do Pedido</div>
            <p style="font-size: 18px; font-weight: bold; font-family: monospace;">${orderId}</p>
          </div>

          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <p class="info-row"><strong>Nome:</strong> ${orderData.customerName || 'N/A'}</p>
            <p class="info-row"><strong>Email:</strong> ${orderData.customerEmail || 'N/A'}</p>
            <p class="info-row"><strong>WhatsApp:</strong> ${orderData.customerWhatsapp || 'N/A'}</p>
            ${whatsappClean ? `<a href="${whatsappLink}" class="whatsapp-btn">💬 Abrir WhatsApp</a>` : ''}
          </div>

          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <p class="info-row"><strong>Música para:</strong> ${orderData.honoreeName || 'N/A'}</p>
            <p class="info-row"><strong>Relacionamento:</strong> ${orderData.relationshipLabel || orderData.relationship || 'N/A'}</p>
            <p class="info-row"><strong>Ocasião:</strong> ${orderData.occasionLabel || orderData.occasion || 'N/A'}</p>
            <p class="info-row"><strong>Estilo Musical:</strong> ${orderData.musicStyleLabel || orderData.musicStyle || 'N/A'}</p>
            <p class="info-row"><strong>Preferência de Voz:</strong> ${orderData.voicePreference === 'feminina' ? 'Feminina' : orderData.voicePreference === 'masculina' ? 'Masculina' : 'Sem preferência'}</p>
          </div>

          ${isChaRevelacao ? `
          <div class="section section-pink">
            <div class="section-title" style="color: #db2777;">🎀 Informações do Chá Revelação</div>
            <div class="baby-box">
              <p class="info-row"><strong>Sabe o sexo?</strong> ${orderData.knowsBabySex === 'sim' ? 'Sim' : 'Não (surpresa!)'}</p>
              ${orderData.knowsBabySex === 'sim' && orderData.babySex ? `<p class="info-row"><strong>Sexo:</strong> ${orderData.babySex === 'menino' ? '💙 Menino' : '💖 Menina'}</p>` : ''}
              ${orderData.babyNameBoy ? `<p class="info-row"><strong>💙 Nome se menino:</strong> ${orderData.babyNameBoy}</p>` : ''}
              ${orderData.babyNameGirl ? `<p class="info-row"><strong>💖 Nome se menina:</strong> ${orderData.babyNameGirl}</p>` : ''}
            </div>
          </div>
          ` : ''}

          ${orderData.storyAndMessage ? `
          <div class="section">
            <div class="section-title">💝 História e Detalhes</div>
            <p>${orderData.storyAndMessage}</p>
          </div>
          ` : ''}

          ${orderData.familyNames ? `
          <div class="section">
            <div class="section-title">👨‍👩‍👧‍👦 Familiares para Mencionar</div>
            <p>${orderData.familyNames}</p>
          </div>
          ` : ''}

          ${lyricsHtml ? `
          <div class="section section-purple">
            <div class="section-title" style="color: #7c3aed;">📝 LETRA APROVADA PELO CLIENTE</div>
            <div class="lyrics-box">${lyricsHtml}</div>
          </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ['cantosdememorias@gmail.com'],
      subject: `🎵 ${isPending ? '⏳ AGUARDANDO PIX' : '✅ PIX PAGO'}: ${orderData.customerName} → ${orderData.honoreeName} [${orderId}]`,
      html: emailHtml,
    });
    console.log(`✅ Email ${status} enviado para admin!`);
  } catch (emailError) {
    console.error('❌ Erro ao enviar email admin:', emailError);
  }
}

async function sendCustomerConfirmationEmail(orderData: any, orderId: string) {
  const lyricsHtml = orderData.generatedLyrics ? orderData.generatedLyrics.replace(/\n/g, '<br>') : '';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 40px 30px; border-radius: 15px 15px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .content { background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .highlight-box { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .order-details { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .lyrics-box { background: linear-gradient(135deg, #ede9fe, #fce7f3); padding: 25px; border-radius: 10px; margin: 20px 0; font-style: italic; line-height: 1.8; white-space: pre-wrap; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        h2 { color: #7c3aed; margin-top: 25px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 Cantos de Memórias</h1>
          <p>Pedido recebido!</p>
        </div>

        <div class="content">
          <p>Olá <strong>${orderData.customerName || 'Cliente'}</strong>,</p>

          <p>Recebemos seu pedido de música personalizada! Estamos muito felizes em fazer parte desse momento especial.</p>

          <div class="highlight-box">
            <strong>⏳ Aguardando pagamento:</strong> Escaneie o QR Code PIX para confirmar seu pedido.
          </div>

          <h2>📋 Resumo do seu pedido</h2>
          <div class="order-details">
            <p><strong>Número do pedido:</strong> ${orderId}</p>
            <p><strong>Música para:</strong> ${orderData.honoreeName || 'N/A'}</p>
            <p><strong>Ocasião:</strong> ${orderData.occasionLabel || orderData.occasion || 'N/A'}</p>
            <p><strong>Estilo musical:</strong> ${orderData.musicStyleLabel || orderData.musicStyle || 'N/A'}</p>
            <p><strong>Valor:</strong> R$ 79,99</p>
          </div>

          ${lyricsHtml ? `
          <h2>📝 Letra da sua música</h2>
          <div class="lyrics-box">${lyricsHtml}</div>
          ` : ''}

          <div class="highlight-box">
            <strong>⏰ Prazo de entrega:</strong> Sua música personalizada será entregue em até <strong>48 horas</strong> após a confirmação do pagamento.
          </div>
        </div>

        <div class="footer">
          <p>🎵 Cantos de Memórias - Transformando sentimentos em música</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [orderData.customerEmail],
      subject: `🎵 Seu pedido foi recebido! - Cantos de Memórias [${orderId}]`,
      html: emailHtml,
    });
    console.log(`✅ Email de confirmação enviado para cliente: ${orderData.customerEmail}`);
  } catch (emailError) {
    console.error('❌ Erro ao enviar email para cliente:', emailError);
  }
}
