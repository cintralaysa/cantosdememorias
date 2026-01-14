import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
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
      const customerName = charge.customer?.name || charge.additionalInfo?.find((i: any) => i.key === 'nome')?.value || 'Cliente';
      const customerEmail = charge.customer?.email || '';
      const value = charge.value || 0;

      console.log('✅ PAGAMENTO PIX CONFIRMADO!');
      console.log('Correlation ID:', correlationID);
      console.log('Cliente:', customerName);
      console.log('Valor:', value);

      // Enviar email de confirmação para admin
      await sendPaymentConfirmedEmail(correlationID, customerName, customerEmail, value, charge);

      // Enviar email de confirmação para cliente
      if (customerEmail) {
        await sendCustomerPaymentConfirmedEmail(customerEmail, customerName, correlationID);
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

async function sendPaymentConfirmedEmail(
  orderId: string,
  customerName: string,
  customerEmail: string,
  value: number,
  chargeData: any
) {
  const valueFormatted = (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const whatsappClean = (chargeData.customer?.phone || '').replace(/\D/g, '');
  const whatsappLink = whatsappClean ? `https://wa.me/55${whatsappClean}` : '#';

  // Extrair informações adicionais se disponíveis
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
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ['cantosdememorias@gmail.com'],
      subject: `🎵 ✅ PIX PAGO: ${customerName} - ${valueFormatted} [${orderId}]`,
      html: emailHtml,
    });
    console.log('✅ Email de pagamento confirmado enviado para admin!');
  } catch (emailError) {
    console.error('❌ Erro ao enviar email:', emailError);
  }
}

async function sendCustomerPaymentConfirmedEmail(
  customerEmail: string,
  customerName: string,
  orderId: string
) {
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
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 Pagamento Confirmado!</h1>
        </div>

        <div class="content">
          <p>Olá <strong>${customerName}</strong>,</p>

          <div class="success-box">
            <h2 style="color: #059669; margin: 0;">✅ Seu pagamento foi confirmado!</h2>
            <p style="margin: 10px 0 0; color: #065f46;">Já estamos preparando sua música personalizada.</p>
          </div>

          <p>Obrigado por confiar na <strong>Cantos de Memórias</strong>! Sua música está sendo criada com muito carinho e dedicação.</p>

          <div class="highlight-box">
            <strong>⏰ Prazo de entrega:</strong> Sua música personalizada será entregue em até <strong>48 horas</strong> pelo WhatsApp.
          </div>

          <p><strong>Número do pedido:</strong> ${orderId}</p>

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
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [customerEmail],
      subject: `✅ Pagamento confirmado! Sua música está sendo criada - Cantos de Memórias`,
      html: emailHtml,
    });
    console.log(`✅ Email de confirmação enviado para cliente: ${customerEmail}`);
  } catch (emailError) {
    console.error('❌ Erro ao enviar email para cliente:', emailError);
  }
}
