import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { Resend } from 'resend';
import { getOrder, updateOrder, OrderData } from '@/lib/orderStore';
import { scheduleGeneration } from '@/lib/qstash';

// Inicialização lazy do Resend
let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cantos de Memórias <contato@cantosdememorias.com.br>';
const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('=== WEBHOOK MERCADO PAGO ===');
    console.log('Body:', JSON.stringify(body, null, 2));

    // MP envia diferentes formatos de notificação
    const action = body.action || body.type || '';
    const paymentId = body.data?.id || body.id;

    if (!paymentId) {
      console.log('Sem payment ID, ignorando');
      return NextResponse.json({ success: true, message: 'No payment ID' });
    }

    // Só processar eventos de pagamento
    if (action && !action.includes('payment')) {
      console.log('Evento não-pagamento ignorado:', action);
      return NextResponse.json({ success: true, message: 'Non-payment event' });
    }

    // Buscar detalhes completos do pagamento no MP
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return NextResponse.json({ error: 'MP não configurado' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);

    let paymentData;
    try {
      paymentData = await paymentClient.get({ id: Number(paymentId) });
    } catch (fetchError) {
      console.error('Erro ao buscar pagamento no MP:', fetchError);
      return NextResponse.json({ error: 'Erro ao buscar pagamento' }, { status: 400 });
    }

    console.log('Payment status:', paymentData.status);
    console.log('External reference:', paymentData.external_reference);
    console.log('Payment method:', paymentData.payment_method_id);
    console.log('Amount:', paymentData.transaction_amount);

    // Só processar pagamentos aprovados
    if (paymentData.status !== 'approved') {
      console.log('Pagamento não aprovado ainda, status:', paymentData.status);
      return NextResponse.json({ success: true, message: `Status: ${paymentData.status}` });
    }

    // Encontrar nosso pedido via external_reference
    const orderId = paymentData.external_reference;
    if (!orderId) {
      console.error('Sem external_reference no pagamento');
      return NextResponse.json({ error: 'Sem referência do pedido' }, { status: 400 });
    }

    const orderData = await getOrder(orderId);
    if (!orderData) {
      console.error('Pedido não encontrado no Redis:', orderId);
      // Enviar email básico pro admin
      await sendBasicAdminEmail(orderId, paymentData);
      return NextResponse.json({ success: true, message: 'Pedido não encontrado, admin notificado' });
    }

    // IDEMPOTÊNCIA: verificar se já foi processado
    if (orderData.emailSentAt) {
      console.log('Pedido já processado (emailSentAt existe), ignorando duplicata');
      return NextResponse.json({ success: true, message: 'Já processado' });
    }

    // Detectar método de pagamento (pix ou card)
    const paymentMethodId = paymentData.payment_method_id || '';
    const isPix = paymentMethodId === 'pix';
    const methodLabel = isPix ? 'pix' : 'card';

    // Marcar como processado imediatamente (prevenir race condition)
    await updateOrder(orderId, {
      status: 'paid',
      paymentMethod: methodLabel,
      emailSentAt: new Date().toISOString(),
    });

    console.log(`✅ Pagamento ${methodLabel.toUpperCase()} confirmado para:`, orderId);

    // Enviar email completo para admin
    await sendAdminOrderEmail(orderData, paymentData, isPix);

    // Enviar email de confirmação para o cliente
    if (orderData.customerEmail) {
      await sendCustomerConfirmationEmail(orderData, isPix);
    }

    // 🎵 Disparar geração automática de música via QStash
    try {
      console.log('🎵 Agendando geração de música via QStash para:', orderId);
      await scheduleGeneration(orderId);
      console.log('🎵 Geração agendada com sucesso via QStash');
    } catch (musicError) {
      console.error('🎵 Erro ao agendar geração:', musicError);
    }

    return NextResponse.json({
      success: true,
      message: 'Pagamento processado',
      orderId,
    });
  } catch (error) {
    console.error('Erro no webhook Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

// GET para verificação do webhook
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Webhook Mercado Pago Cantos de Memórias ativo',
    timestamp: new Date().toISOString(),
  });
}

// ===== FUNÇÕES DE EMAIL =====

// Email completo para admin
async function sendAdminOrderEmail(orderData: OrderData, paymentData: any, isPix: boolean = false) {
  const valueFormatted = (orderData.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const lyricsHtml = orderData.generatedLyrics ? orderData.generatedLyrics.replace(/\n/g, '<br>') : '';
  const isChaRevelacao = orderData.relationship === 'cha-revelacao' || orderData.occasion === 'cha-revelacao';
  const paymentMethodLabel = paymentData.payment_method_id || 'Cartão';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 8px 20px; border-radius: 20px; font-weight: bold; margin-top: 10px; font-size: 18px; }
        .content { background: #f9fafb; padding: 25px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .section-title { font-weight: bold; color: #2563eb; margin-bottom: 15px; font-size: 16px; }
        .info-row { margin: 8px 0; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; white-space: pre-wrap; }
        .success-box { background: #dbeafe; border: 2px solid #3b82f6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${isPix ? '🟢 PIX' : '💳 CARTÃO'} CONFIRMADO - PEDIDO COMPLETO!</h1>
          <div class="badge">✅ PAGAMENTO VIA ${isPix ? 'PIX' : paymentMethodLabel.toUpperCase()}</div>
        </div>

        <div class="content">
          <div class="success-box">
            <h2 style="color: #2563eb; margin: 0;">💰 ${valueFormatted}</h2>
            <p style="margin: 5px 0 0; color: #1e40af;">Pagamento via cartão confirmado!</p>
          </div>

          <div class="section">
            <div class="section-title">📋 ID do Pedido</div>
            <p style="font-size: 18px; font-weight: bold; font-family: monospace;">${orderData.orderId}</p>
          </div>

          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <p class="info-row"><strong>Nome:</strong> ${orderData.customerName}</p>
            <p class="info-row"><strong>Email:</strong> ${orderData.customerEmail || 'N/A'}</p>
            <p class="info-row"><strong>WhatsApp:</strong> ${orderData.customerWhatsapp || 'N/A'}</p>
          </div>

          <div class="section" style="border-left-color: #8b5cf6;">
            <div class="section-title" style="color: #7c3aed;">🎵 Detalhes da Música</div>
            <p class="info-row"><strong>Plano:</strong> ${orderData.plan === 'premium' ? '⭐ Premium (3 músicas)' : 'Básico (1 música)'}</p>
            <p class="info-row"><strong>Para:</strong> ${orderData.honoreeName}</p>
            <p class="info-row"><strong>Relação:</strong> ${orderData.relationshipLabel || orderData.relationship}</p>
            <p class="info-row"><strong>Ocasião:</strong> ${orderData.occasionLabel || orderData.occasion}</p>
            <p class="info-row"><strong>Estilo:</strong> ${orderData.musicStyleLabel || orderData.musicStyle}</p>
            ${orderData.musicStyle2 ? `<p class="info-row"><strong>2º Estilo:</strong> ${orderData.musicStyle2Label || orderData.musicStyle2}</p>` : ''}
            <p class="info-row"><strong>Voz:</strong> ${orderData.voicePreference === 'feminina' ? '👩 Feminina' : '👨 Masculina'}</p>
          </div>

          ${isChaRevelacao ? `
          <div class="section" style="border-left-color: #ec4899; background: linear-gradient(135deg, #fce7f3, #dbeafe);">
            <div class="section-title" style="color: #be185d;">🍼 Chá Revelação</div>
            <p class="info-row"><strong>Sabe o sexo?</strong> ${orderData.knowsBabySex === 'sim' ? 'Sim' : 'Não'}</p>
            ${orderData.babySex ? `<p class="info-row"><strong>Sexo:</strong> ${orderData.babySex === 'menino' ? '💙 Menino' : '💗 Menina'}</p>` : ''}
            ${orderData.babyNameBoy ? `<p class="info-row"><strong>Nome menino:</strong> ${orderData.babyNameBoy}</p>` : ''}
            ${orderData.babyNameGirl ? `<p class="info-row"><strong>Nome menina:</strong> ${orderData.babyNameGirl}</p>` : ''}
          </div>
          ` : ''}

          ${orderData.storyAndMessage ? `
          <div class="section" style="border-left-color: #ec4899;">
            <div class="section-title" style="color: #be185d;">💬 História e Mensagem</div>
            <p style="white-space: pre-wrap;">${orderData.storyAndMessage}</p>
          </div>
          ` : ''}

          ${orderData.familyNames ? `
          <div class="section">
            <div class="section-title">👨‍👩‍👧‍👦 Nomes para mencionar</div>
            <p>${orderData.familyNames}</p>
          </div>
          ` : ''}

          ${lyricsHtml ? `
          <div class="section">
            <div class="section-title">📝 Letra Gerada</div>
            <div class="lyrics-box">${lyricsHtml}</div>
          </div>
          ` : ''}

          <div class="section" style="background: #ecfdf5; border-left-color: #10b981;">
            <div class="section-title" style="color: #059669;">⚡ Entrega Automática</div>
            <p><strong>Status:</strong> A música será gerada automaticamente em poucos minutos.</p>
            <p>O cliente receberá o link por e-mail e poderá ouvir e baixar direto no site.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `${isPix ? '🟢 PIX' : '💳 CARTÃO'} ✅ PAGO: ${orderData.customerName} → ${orderData.honoreeName} [${orderData.orderId}]`,
      html: emailHtml,
    });
    console.log('✅ Email completo enviado para admin (cartão)');
  } catch (emailError) {
    console.error('❌ Erro ao enviar email admin:', emailError);
  }
}

// Email de confirmação para o cliente
async function sendCustomerConfirmationEmail(orderData: OrderData, isPix: boolean = false) {
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
            <p><strong>Plano:</strong> ${orderData.plan === 'premium' ? '⭐ Premium (3 músicas)' : 'Básico (1 música)'}</p>
            <p><strong>Música para:</strong> ${orderData.honoreeName}</p>
            <p><strong>Ocasião:</strong> ${orderData.occasionLabel || orderData.occasion}</p>
            <p><strong>Estilo musical:</strong> ${orderData.musicStyleLabel || orderData.musicStyle}</p>
            ${orderData.plan === 'premium' && orderData.musicStyle2Label ? `<p><strong>2º Estilo musical:</strong> ${orderData.musicStyle2Label || orderData.musicStyle2}</p>` : ''}
            <p><strong>Pagamento:</strong> ${isPix ? 'PIX' : 'Cartão de Crédito/Débito'} ✅</p>
          </div>

          ${lyricsHtml ? `
          <h2>📝 Letra da sua música</h2>
          <div class="lyrics-box">${lyricsHtml}</div>
          ` : ''}

          <div class="highlight-box">
            <strong>⏰ Sua música está sendo gerada automaticamente!</strong> Em poucos minutos você receberá um email com o link para ouvir e baixar sua música personalizada.
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
    const recipients = [orderData.customerEmail];
    if (orderData.customerEmail !== ADMIN_EMAIL) {
      recipients.push(ADMIN_EMAIL);
    }
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject: `✅ Pagamento confirmado! Sua música está sendo criada - Cantos de Memórias`,
      html: emailHtml,
    });
    console.log(`✅ Email confirmação (cartão) enviado para: ${recipients.join(', ')}`);
  } catch (emailError) {
    console.error('❌ Erro ao enviar email cliente:', emailError);
  }
}

// Email básico fallback para admin (se pedido não encontrado no Redis)
async function sendBasicAdminEmail(orderId: string, paymentData: any) {
  const amount = paymentData.transaction_amount || 0;
  const payerEmail = paymentData.payer?.email || 'N/A';
  const payerName = `${paymentData.payer?.first_name || ''} ${paymentData.payer?.last_name || ''}`.trim() || 'N/A';

  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `💳 ⚠️ CARTÃO PAGO (sem dados Redis): ${payerName} - R$${amount.toFixed(2)} [${orderId}]`,
      html: `
        <h2>💳 Pagamento via Cartão Confirmado</h2>
        <p><strong>⚠️ Dados do pedido NÃO encontrados no Redis.</strong></p>
        <hr>
        <p><strong>Pedido:</strong> ${orderId}</p>
        <p><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
        <p><strong>Cliente:</strong> ${payerName}</p>
        <p><strong>Email:</strong> ${payerEmail}</p>
        <p><strong>Método:</strong> ${paymentData.payment_method_id || 'Cartão'}</p>
        <p><strong>MP Payment ID:</strong> ${paymentData.id}</p>
        <hr>
        <p>Verifique no painel do Mercado Pago e entre em contato com o cliente.</p>
      `,
    });
    console.log('✅ Email fallback enviado para admin');
  } catch (e) {
    console.error('❌ Erro email fallback:', e);
  }
}
