import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getOrder, OrderData } from '@/lib/orderStore';

// Inicialização lazy do Resend para evitar erro no build
let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cantos de Memórias <onboarding@resend.dev>';

// Webhook da OpenPix para confirmação de pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('=== WEBHOOK PIX OPENPIX ===');
    console.log('Evento recebido:', JSON.stringify(body, null, 2));

    // OpenPix envia diferentes eventos
    const event = body.event || body.type;
    const charge = body.charge || body.pix || body;

    // Verificar se é confirmação de pagamento
    if (event === 'OPENPIX:CHARGE_COMPLETED' || event === 'OPENPIX:TRANSACTION_RECEIVED' || charge.status === 'COMPLETED') {
      const correlationID = charge.correlationID || charge.txid || '';
      const value = charge.value || 0;

      console.log('✅ PAGAMENTO PIX CONFIRMADO!');
      console.log('Correlation ID:', correlationID);
      console.log('Valor:', value);

      // Buscar dados completos do pedido no Redis
      const orderData = await getOrder(correlationID);

      if (orderData) {
        console.log('✅ Dados do pedido encontrados no Redis');
        // Enviar email completo para admin com todos os dados
        await sendCompleteOrderEmail(orderData);

        // Enviar email de confirmação para cliente
        if (orderData.customerEmail) {
          await sendCustomerPaymentConfirmedEmail(orderData);
        }
      } else {
        console.log('⚠️ Dados do pedido NÃO encontrados no Redis - enviando email básico');
        // Fallback: enviar email com dados básicos do webhook
        const customerName = charge.customer?.name || 'Cliente';
        const customerEmail = charge.customer?.email || '';
        await sendBasicPaymentEmail(correlationID, customerName, customerEmail, value, charge);
      }

      return NextResponse.json({
        success: true,
        message: 'Pagamento processado',
        correlationID
      });
    }

    // Outros eventos (expirado, falhou, etc)
    console.log('Evento não processável:', event);
    return NextResponse.json({
      success: true,
      message: 'Evento recebido',
      event
    });

  } catch (error) {
    console.error('Erro no webhook PIX:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

// Aceitar GET para verificação do webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook PIX Cantos de Memórias ativo',
    timestamp: new Date().toISOString()
  });
}

// Email COMPLETO para admin com todos os dados do pedido
async function sendCompleteOrderEmail(orderData: OrderData) {
  const lyricsHtml = orderData.generatedLyrics ? orderData.generatedLyrics.replace(/\n/g, '<br>') : '';
  const isChaRevelacao = orderData.relationship === 'cha-revelacao' || orderData.occasion === 'cha-revelacao';
  const whatsappClean = (orderData.customerWhatsapp || '').replace(/\D/g, '');
  const whatsappLink = whatsappClean ? `https://wa.me/55${whatsappClean}` : '#';
  const valueFormatted = (orderData.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin-top: 10px; font-size: 18px; }
        .content { background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .section-purple { border-left-color: #8b5cf6; }
        .section-pink { border-left-color: #ec4899; }
        .section-title { font-weight: bold; color: #059669; margin-bottom: 15px; font-size: 16px; }
        .info-row { margin: 8px 0; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; white-space: pre-wrap; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; }
        .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .baby-box { background: linear-gradient(135deg, #fce7f3, #dbeafe); padding: 15px; border-radius: 8px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 PIX CONFIRMADO - PEDIDO COMPLETO!</h1>
          <div class="badge">✅ PAGAMENTO RECEBIDO</div>
        </div>

        <div class="content">
          <div class="success-box">
            <h2 style="color: #059669; margin: 0;">💰 ${valueFormatted}</h2>
            <p style="margin: 5px 0 0; color: #065f46;">Pagamento confirmado com sucesso!</p>
          </div>

          <div class="section">
            <div class="section-title">📋 ID do Pedido</div>
            <p style="font-size: 18px; font-weight: bold; font-family: monospace;">${orderData.orderId}</p>
          </div>

          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <p class="info-row"><strong>Nome:</strong> ${orderData.customerName || 'N/A'}</p>
            <p class="info-row"><strong>Email:</strong> ${orderData.customerEmail || 'N/A'}</p>
            <p class="info-row"><strong>WhatsApp:</strong> ${orderData.customerWhatsapp || 'N/A'}</p>
            ${whatsappClean ? `<p style="margin-top: 15px;"><a href="${whatsappLink}" class="whatsapp-btn">💬 Abrir WhatsApp do Cliente</a></p>` : ''}
          </div>

          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <p class="info-row"><strong>Música para:</strong> ${orderData.honoreeName || 'N/A'}</p>
            <p class="info-row"><strong>Relacionamento:</strong> ${orderData.relationshipLabel || orderData.relationship || 'N/A'}</p>
            <p class="info-row"><strong>Ocasião:</strong> ${orderData.occasionLabel || orderData.occasion || 'N/A'}</p>
            <p class="info-row"><strong>Plano:</strong> ${orderData.plan === 'premium' ? '⭐ PREMIUM (2 músicas)' : 'Básico (1 música)'}</p>
            <p class="info-row"><strong>Estilo Musical 1:</strong> ${orderData.musicStyleLabel || orderData.musicStyle || 'N/A'}</p>
            ${orderData.plan === 'premium' && orderData.musicStyle2Label ? `<p class="info-row"><strong>Estilo Musical 2:</strong> ${orderData.musicStyle2Label || orderData.musicStyle2 || 'N/A'}</p>` : ''}
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
            <p>${orderData.storyAndMessage.replace(/\n/g, '<br>')}</p>
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

          <div class="section" style="background: #fef3c7; border-left-color: #f59e0b;">
            <div class="section-title" style="color: #d97706;">⏰ Próximo Passo</div>
            <p><strong>Prazo de entrega:</strong> ${orderData.plan === 'premium' ? 'No mesmo dia ⚡' : 'Até 24 horas'}</p>
            <p>Entre em contato com o cliente pelo WhatsApp para confirmar os detalhes e entregar a música personalizada.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: ['cantosdememorias@gmail.com'],
      subject: `🎵 ✅ PIX PAGO: ${orderData.customerName} → ${orderData.honoreeName} [${orderData.orderId}]`,
      html: emailHtml,
    });
    console.log('✅ Email COMPLETO enviado para admin!');
  } catch (emailError) {
    console.error('❌ Erro ao enviar email:', emailError);
  }
}

// Email básico (fallback se não encontrar no Redis)
async function sendBasicPaymentEmail(
  orderId: string,
  customerName: string,
  customerEmail: string,
  value: number,
  chargeData: any
) {
  const valueFormatted = (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const whatsappClean = (chargeData.customer?.phone || '').replace(/\D/g, '');
  const whatsappLink = whatsappClean ? `https://wa.me/55${whatsappClean}` : '#';

  const additionalInfo = chargeData.additionalInfo || [];
  const honoreeName = additionalInfo.find((i: any) => i.key === 'Homenageado')?.value || '';
  const occasion = additionalInfo.find((i: any) => i.key === 'Ocasião')?.value || '';
  const style = additionalInfo.find((i: any) => i.key === 'Estilo')?.value || '';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .badge { display: inline-block; background: #d1fae5; color: #065f46; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin-top: 10px; font-size: 18px; }
        .content { background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .section-title { font-weight: bold; color: #059669; margin-bottom: 15px; font-size: 16px; }
        .info-row { margin: 8px 0; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; }
        .success-box { background: #d1fae5; border: 2px solid #10b981; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .warning-box { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 PIX CONFIRMADO!</h1>
          <div class="badge">✅ PAGAMENTO RECEBIDO</div>
        </div>

        <div class="content">
          <div class="success-box">
            <h2 style="color: #059669; margin: 0;">💰 ${valueFormatted}</h2>
            <p style="margin: 5px 0 0; color: #065f46;">Pagamento confirmado com sucesso!</p>
          </div>

          <div class="warning-box">
            <strong>⚠️ Atenção:</strong> Os dados completos do pedido não foram encontrados. Entre em contato com o cliente para obter os detalhes.
          </div>

          <div class="section">
            <div class="section-title">📋 Pedido</div>
            <p class="info-row"><strong>ID:</strong> <code>${orderId}</code></p>
            ${honoreeName ? `<p class="info-row"><strong>Homenageado:</strong> ${honoreeName}</p>` : ''}
            ${occasion ? `<p class="info-row"><strong>Ocasião:</strong> ${occasion}</p>` : ''}
            ${style ? `<p class="info-row"><strong>Estilo:</strong> ${style}</p>` : ''}
          </div>

          <div class="section">
            <div class="section-title">👤 Cliente</div>
            <p class="info-row"><strong>Nome:</strong> ${customerName}</p>
            <p class="info-row"><strong>Email:</strong> ${customerEmail || 'N/A'}</p>
            <p class="info-row"><strong>WhatsApp:</strong> ${chargeData.customer?.phone || 'N/A'}</p>
            ${whatsappClean ? `<p style="margin-top: 15px;"><a href="${whatsappLink}" class="whatsapp-btn">💬 Abrir WhatsApp do Cliente</a></p>` : ''}
          </div>

          <div class="section" style="background: #fef3c7; border-left-color: #f59e0b;">
            <div class="section-title" style="color: #d97706;">⏰ Próximo Passo</div>
            <p><strong>Prazo de entrega:</strong> 48 horas</p>
            <p>Entre em contato com o cliente para confirmar os detalhes e entregar a música personalizada.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: ['cantosdememorias@gmail.com'],
      subject: `🎵 ✅ PIX PAGO: ${customerName} - ${valueFormatted} [${orderId}]`,
      html: emailHtml,
    });
    console.log('✅ Email básico de pagamento enviado para admin!');
  } catch (emailError) {
    console.error('❌ Erro ao enviar email:', emailError);
  }
}

// Email de confirmação para o cliente
async function sendCustomerPaymentConfirmedEmail(orderData: OrderData) {
  const lyricsHtml = orderData.generatedLyrics ? orderData.generatedLyrics.replace(/\n/g, '<br>') : '';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px 30px; border-radius: 15px 15px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .success-box { background: linear-gradient(135deg, #d1fae5, #a7f3d0); padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; }
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
          <h1>🎵 Pagamento Confirmado!</h1>
        </div>

        <div class="content">
          <p>Olá <strong>${orderData.customerName}</strong>,</p>

          <div class="success-box">
            <h2 style="color: #059669; margin: 0;">✅ Seu pagamento foi confirmado!</h2>
            <p style="margin: 10px 0 0; color: #065f46;">Já estamos preparando sua música personalizada.</p>
          </div>

          <p>Obrigado por confiar na <strong>Cantos de Memórias</strong>! Sua música está sendo criada com muito carinho e dedicação.</p>

          <h2>📋 Resumo do seu pedido</h2>
          <div class="order-details">
            <p><strong>Número do pedido:</strong> ${orderData.orderId}</p>
            <p><strong>Plano:</strong> ${orderData.plan === 'premium' ? '⭐ Premium (2 músicas)' : 'Básico (1 música)'}</p>
            <p><strong>Música para:</strong> ${orderData.honoreeName}</p>
            <p><strong>Ocasião:</strong> ${orderData.occasionLabel || orderData.occasion}</p>
            <p><strong>Estilo musical:</strong> ${orderData.musicStyleLabel || orderData.musicStyle}</p>
            ${orderData.plan === 'premium' && orderData.musicStyle2Label ? `<p><strong>2º Estilo musical:</strong> ${orderData.musicStyle2Label || orderData.musicStyle2}</p>` : ''}
          </div>

          ${lyricsHtml ? `
          <h2>📝 Letra da sua música</h2>
          <div class="lyrics-box">${lyricsHtml}</div>
          ` : ''}

          <div class="highlight-box">
            <strong>⏰ Prazo de entrega:</strong> Sua música personalizada será entregue <strong>${orderData.plan === 'premium' ? 'ainda no mesmo dia!' : 'em até 24 horas'}</strong> pelo WhatsApp.
          </div>

          <p>Qualquer dúvida, estamos à disposição!</p>
        </div>

        <div class="footer">
          <p>🎵 Cantos de Memórias - Transformando sentimentos em música</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: [orderData.customerEmail],
      subject: `✅ Pagamento confirmado! Sua música está sendo criada - Cantos de Memórias`,
      html: emailHtml,
    });
    console.log(`✅ Email de confirmação enviado para cliente: ${orderData.customerEmail}`);
  } catch (emailError) {
    console.error('❌ Erro ao enviar email para cliente:', emailError);
  }
}
