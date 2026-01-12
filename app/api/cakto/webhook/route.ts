import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { kv } from '@vercel/kv';

const resend = new Resend(process.env.RESEND_API_KEY);

// Webhook da Cakto - recebe notificações de pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('=== WEBHOOK CAKTO RECEBIDO ===');
    console.log(JSON.stringify(body, null, 2));

    // Eventos da Cakto - verificar diferentes formatos possíveis
    const event = body.event || body.type || body.status;
    const data = body.data || body;

    // Lista de eventos de pagamento aprovado
    const approvedEvents = [
      'purchase_approved',
      'sale_approved',
      'payment_approved',
      'approved',
      'APPROVED',
      'paid',
      'PAID'
    ];

    // Verificar se é um pagamento aprovado
    if (approvedEvents.includes(event) || body.status === 'approved' || body.status === 'paid') {
      await handlePaymentApproved(data, body);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook Cakto:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

async function handlePaymentApproved(data: any, fullBody: any) {
  console.log('=== PAGAMENTO APROVADO CAKTO ===');

  // Extrair dados do cliente da Cakto
  const customer = data.customer || data.buyer || data.client || fullBody.customer || fullBody.buyer || {};
  const product = data.product || data.offer || fullBody.product || {};
  const transaction = data.transaction || data.payment || fullBody.transaction || fullBody.payment || data;

  // Dados do cliente vindos da Cakto
  const customerName = customer.name || customer.full_name || customer.nome || 'N/A';
  const customerEmail = customer.email || 'N/A';
  const customerPhone = customer.phone || customer.phone_number || customer.cellphone || customer.telefone || 'N/A';

  const amount = transaction.amount || transaction.value || transaction.total || product.price || fullBody.amount || fullBody.value || 0;
  const paymentMethod = transaction.payment_method || transaction.method || fullBody.payment_method || 'N/A';
  const transactionId = transaction.id || transaction.transaction_id || data.id || fullBody.id || 'N/A';

  // Tentar buscar o orderId do parâmetro SRC
  const src = data.src || fullBody.src || data.tracking?.src || fullBody.tracking?.src ||
              data.utm_source || fullBody.utm_source || '';

  // Dados do pedido salvos no KV (se existirem)
  let savedOrder: any = null;

  if (src && src.startsWith('ORD-')) {
    try {
      const orderDataStr = await kv.get(`cakto_order:${src}`);
      if (orderDataStr) {
        savedOrder = typeof orderDataStr === 'string' ? JSON.parse(orderDataStr) : orderDataStr;
        console.log('Pedido encontrado no KV:', src);

        // Marcar como pago
        await kv.set(`cakto_order:${src}`, JSON.stringify({
          ...savedOrder,
          status: 'paid',
          paidAt: new Date().toISOString(),
          transactionId
        }), { ex: 604800 });
      }
    } catch (e) {
      console.log('Pedido não encontrado no KV:', src);
    }
  }

  // Usar dados do pedido salvo se disponíveis, senão usar dados da Cakto
  const honoree_name = savedOrder?.honoreeName || 'N/A';
  const relationship = savedOrder?.relationship || 'N/A';
  const relationshipLabel = savedOrder?.relationshipLabel || relationship;
  const occasion = savedOrder?.occasion || 'N/A';
  const occasionLabel = savedOrder?.occasionLabel || occasion;
  const music_style = savedOrder?.musicStyle || 'N/A';
  const musicStyleLabel = savedOrder?.musicStyleLabel || music_style;
  const voice_preference = savedOrder?.voicePreference || 'N/A';
  const qualities = savedOrder?.storyAndMessage || '';
  const family_names = savedOrder?.familyNames || '';
  const approved_lyrics = savedOrder?.generatedLyrics || '';

  // Dados de chá revelação
  const knowsBabySex = savedOrder?.knowsBabySex || '';
  const babySex = savedOrder?.babySex || '';
  const babyNameBoy = savedOrder?.babyNameBoy || '';
  const babyNameGirl = savedOrder?.babyNameGirl || '';

  // Usar nome/email/telefone do pedido salvo se disponíveis
  const finalCustomerName = savedOrder?.customerName || customerName;
  const finalCustomerEmail = savedOrder?.customerEmail || customerEmail;
  const finalCustomerPhone = savedOrder?.customerWhatsapp || customerPhone;

  // Formatar valor
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 79.99;
  const formattedAmount = `R$ ${numericAmount.toFixed(2).replace('.', ',')}`;

  // Preparar WhatsApp link
  const whatsappClean = finalCustomerPhone.replace(/\D/g, '');
  const whatsappLink = whatsappClean ? `https://wa.me/55${whatsappClean}` : '#';

  // Formatar letra para HTML
  const lyricsHtml = approved_lyrics ? approved_lyrics.replace(/\n/g, '<br>') : '';

  // Verificar se é chá revelação
  const isChaRevelacao = relationship === 'cha-revelacao' || occasion === 'cha-revelacao';

  // Criar email HTML
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .badge { display: inline-block; background: #fbbf24; color: #92400e; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .section-purple { border-left-color: #8b5cf6; }
        .section-pink { border-left-color: #ec4899; }
        .section-title { font-weight: bold; color: #059669; margin-bottom: 15px; font-size: 16px; }
        .amount { font-size: 36px; font-weight: bold; color: #059669; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; white-space: pre-wrap; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
        .info-row { margin: 8px 0; }
        .label { color: #6b7280; }
        .baby-box { background: linear-gradient(135deg, #fce7f3, #dbeafe); padding: 15px; border-radius: 8px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 NOVO PEDIDO - CAKTO</h1>
          <div class="badge">Pagamento Confirmado via ${paymentMethod}</div>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">💰 Pagamento</div>
            <p class="amount">${formattedAmount}</p>
            <p class="info-row"><span class="label">ID Transação:</span> ${transactionId}</p>
            <p class="info-row"><span class="label">Método:</span> ${paymentMethod}</p>
            ${src ? `<p class="info-row"><span class="label">Order ID:</span> ${src}</p>` : ''}
          </div>

          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <p class="info-row"><strong>Nome:</strong> ${finalCustomerName}</p>
            <p class="info-row"><strong>Email:</strong> ${finalCustomerEmail}</p>
            <p class="info-row"><strong>WhatsApp:</strong> ${finalCustomerPhone}</p>
            <a href="${whatsappLink}" class="whatsapp-btn">💬 Abrir WhatsApp</a>
          </div>

          ${honoree_name !== 'N/A' ? `
          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <p class="info-row"><strong>Música para:</strong> ${honoree_name}</p>
            <p class="info-row"><strong>Relacionamento:</strong> ${relationshipLabel}</p>
            <p class="info-row"><strong>Ocasião:</strong> ${occasionLabel}</p>
            <p class="info-row"><strong>Estilo Musical:</strong> ${musicStyleLabel}</p>
            <p class="info-row"><strong>Preferência de Voz:</strong> ${voice_preference === 'feminina' ? 'Feminina' : voice_preference === 'masculina' ? 'Masculina' : 'Sem preferência'}</p>
          </div>
          ` : ''}

          ${isChaRevelacao ? `
          <div class="section section-pink">
            <div class="section-title" style="color: #db2777;">🎀 Informações do Chá Revelação</div>
            <div class="baby-box">
              <p class="info-row"><strong>Sabe o sexo?</strong> ${knowsBabySex === 'sim' ? 'Sim' : 'Não (surpresa!)'}</p>
              ${knowsBabySex === 'sim' && babySex ? `<p class="info-row"><strong>Sexo:</strong> ${babySex === 'menino' ? '💙 Menino' : '💖 Menina'}</p>` : ''}
              ${babyNameBoy ? `<p class="info-row"><strong>💙 Nome se menino:</strong> ${babyNameBoy}</p>` : ''}
              ${babyNameGirl ? `<p class="info-row"><strong>💖 Nome se menina:</strong> ${babyNameGirl}</p>` : ''}
            </div>
          </div>
          ` : ''}

          ${qualities ? `
          <div class="section">
            <div class="section-title">💝 História e Detalhes</div>
            <p>${qualities}</p>
          </div>
          ` : ''}

          ${family_names ? `
          <div class="section">
            <div class="section-title">👨‍👩‍👧‍👦 Familiares para Mencionar</div>
            <p>${family_names}</p>
          </div>
          ` : ''}

          ${lyricsHtml ? `
          <div class="section section-purple">
            <div class="section-title" style="color: #7c3aed;">📝 LETRA APROVADA PELO CLIENTE</div>
            <div class="lyrics-box">${lyricsHtml}</div>
          </div>
          ` : '<div class="section"><div class="section-title">⚠️ Atenção</div><p>Letra não encontrada nos dados do pedido. Verificar com o cliente.</p></div>'}
        </div>
      </div>
    </body>
    </html>
  `;

  // Enviar email para admin
  try {
    await resend.emails.send({
      from: 'Cantos de Memórias <contato@cantosdememorias.com.br>',
      to: ['cantosdememorias@gmail.com'],
      subject: `🎵 NOVO PEDIDO CAKTO: ${finalCustomerName} → ${honoree_name} - ${formattedAmount}`,
      html: emailHtml,
    });
    console.log('Email admin enviado com sucesso!');
  } catch (emailError) {
    console.error('Erro ao enviar email admin:', emailError);
  }

  // Enviar email de confirmação para o cliente
  if (finalCustomerEmail && finalCustomerEmail !== 'N/A' && finalCustomerEmail.includes('@')) {
    const clientEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 Pedido Confirmado!</h1>
            <p>Obrigado por escolher Cantos de Memórias</p>
          </div>

          <div class="content">
            <p>Olá <strong>${finalCustomerName}</strong>,</p>

            <p>Recebemos seu pedido de música personalizada${honoree_name !== 'N/A' ? ` para <strong>${honoree_name}</strong>` : ''}!</p>

            <div class="highlight">
              <p><strong>📋 Resumo do Pedido:</strong></p>
              <p>Valor: <strong>${formattedAmount}</strong></p>
              ${occasionLabel !== 'N/A' ? `<p>Ocasião: ${occasionLabel}</p>` : ''}
              ${musicStyleLabel !== 'N/A' ? `<p>Estilo: ${musicStyleLabel}</p>` : ''}
            </div>

            <p><strong>Próximos passos:</strong></p>
            <ol>
              <li>Nossa equipe já está trabalhando na sua música</li>
              <li>Você receberá a música em até 24 horas</li>
              <li>Qualquer dúvida, entre em contato pelo WhatsApp</li>
            </ol>

            <div class="footer">
              <p>Cantos de Memórias - Transformando sentimentos em melodias</p>
              <p>📧 contato@cantosdememorias.com.br</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: 'Cantos de Memórias <contato@cantosdememorias.com.br>',
        to: [finalCustomerEmail],
        subject: `🎵 Pedido Confirmado - Sua música está sendo criada!`,
        html: clientEmailHtml,
      });
      console.log('Email cliente enviado com sucesso!');
    } catch (emailError) {
      console.error('Erro ao enviar email cliente:', emailError);
    }
  }
}

// GET para verificar se o endpoint está ativo
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Webhook Cakto está funcionando',
    timestamp: new Date().toISOString()
  });
}
