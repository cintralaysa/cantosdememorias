import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Tentar importar KV, mas funcionar sem ele
let kv: any = null;
try {
  kv = require('@vercel/kv').kv;
} catch (e) {
  console.log('Vercel KV não disponível no webhook');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Definir remetente - usar domínio verificado ou fallback para teste
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cantos de Memórias <onboarding@resend.dev>';

// Webhook da Cakto - recebe notificações de pagamento
export async function POST(request: NextRequest) {
  console.log('=== WEBHOOK CAKTO - INÍCIO ===');
  console.log('RESEND_API_KEY presente:', !!process.env.RESEND_API_KEY);
  console.log('FROM_EMAIL:', FROM_EMAIL);

  try {
    const body = await request.json();

    console.log('=== WEBHOOK CAKTO RECEBIDO ===');
    console.log('Body completo:', JSON.stringify(body, null, 2));

    // Sempre processar como pagamento aprovado se tiver dados
    // A Cakto envia diferentes formatos dependendo da configuração
    await handlePaymentApproved(body);

    return NextResponse.json({ received: true, success: true });
  } catch (error) {
    console.error('Erro no webhook Cakto:', error);
    return NextResponse.json({ error: 'Webhook error', details: String(error) }, { status: 500 });
  }
}

async function handlePaymentApproved(body: any) {
  console.log('=== PROCESSANDO PAGAMENTO CAKTO ===');

  // A Cakto pode enviar dados em diferentes estruturas
  // Vamos extrair de todas as formas possíveis
  const data = body.data || body;

  // Dados do cliente - tentar múltiplos caminhos
  const customer = data.customer || data.buyer || data.client ||
                   body.customer || body.buyer || body.client || {};

  // Dados do produto/oferta
  const product = data.product || data.offer || body.product || body.offer || {};

  // Dados da transação
  const transaction = data.transaction || data.payment ||
                      body.transaction || body.payment || {};

  // Extrair nome do cliente de várias fontes possíveis
  const customerName = customer.name || customer.full_name || customer.nome ||
                       data.customer_name || data.buyer_name || body.customer_name ||
                       body.name || 'Cliente Cakto';

  // Email
  const customerEmail = customer.email || data.customer_email || data.buyer_email ||
                        body.customer_email || body.email || '';

  // Telefone
  const customerPhone = customer.phone || customer.phone_number || customer.cellphone ||
                        customer.telefone || customer.whatsapp ||
                        data.customer_phone || data.phone || body.phone || '';

  // Valor
  const amount = transaction.amount || transaction.value || transaction.total ||
                 data.amount || data.value || data.total ||
                 product.price || body.amount || body.value || body.total || 0;

  // Método de pagamento
  const paymentMethod = transaction.payment_method || transaction.method ||
                        data.payment_method || body.payment_method ||
                        body.method || 'PIX/Cartão';

  // ID da transação
  const transactionId = transaction.id || transaction.transaction_id ||
                        data.transaction_id || data.id ||
                        body.transaction_id || body.id ||
                        `CAKTO-${Date.now()}`;

  // Buscar SRC (nosso orderId) - verificar TODOS os lugares possíveis
  const src = data.src || body.src ||
              data.tracking?.src || body.tracking?.src ||
              data.utm_source || body.utm_source ||
              data.metadata?.src || body.metadata?.src ||
              data.custom?.src || body.custom?.src ||
              data.reference || body.reference ||
              extractSrcFromUrl(body) || '';

  console.log('Dados extraídos:');
  console.log('- Nome:', customerName);
  console.log('- Email:', customerEmail);
  console.log('- Telefone:', customerPhone);
  console.log('- Valor:', amount);
  console.log('- Método:', paymentMethod);
  console.log('- Transaction ID:', transactionId);
  console.log('- SRC/Order ID:', src);

  // Dados do pedido salvos no KV
  let savedOrder: any = null;

  if (kv && src && src.startsWith('ORD-')) {
    try {
      const orderDataStr = await kv.get(`cakto_order:${src}`);
      if (orderDataStr) {
        savedOrder = typeof orderDataStr === 'string' ? JSON.parse(orderDataStr) : orderDataStr;
        console.log('✅ Pedido encontrado no KV:', src);

        // Marcar como pago
        await kv.set(`cakto_order:${src}`, JSON.stringify({
          ...savedOrder,
          status: 'paid',
          paidAt: new Date().toISOString(),
          transactionId
        }), { ex: 604800 });
      } else {
        console.log('⚠️ Pedido não encontrado no KV:', src);
      }
    } catch (e) {
      console.log('⚠️ Erro ao buscar no KV:', e);
    }
  } else {
    console.log('⚠️ KV não disponível ou SRC inválido. SRC:', src);
  }

  // Usar dados do pedido salvo se disponíveis
  const finalCustomerName = savedOrder?.customerName || customerName;
  const finalCustomerEmail = savedOrder?.customerEmail || customerEmail;
  const finalCustomerPhone = savedOrder?.customerWhatsapp || customerPhone;

  const honoree_name = savedOrder?.honoreeName || 'Não informado';
  const relationship = savedOrder?.relationship || '';
  const relationshipLabel = savedOrder?.relationshipLabel || relationship || 'Não informado';
  const occasion = savedOrder?.occasion || '';
  const occasionLabel = savedOrder?.occasionLabel || occasion || 'Não informado';
  const music_style = savedOrder?.musicStyle || '';
  const musicStyleLabel = savedOrder?.musicStyleLabel || music_style || 'Não informado';
  const voice_preference = savedOrder?.voicePreference || 'Não informado';
  const qualities = savedOrder?.storyAndMessage || '';
  const family_names = savedOrder?.familyNames || '';
  const approved_lyrics = savedOrder?.generatedLyrics || '';

  // Dados de chá revelação
  const knowsBabySex = savedOrder?.knowsBabySex || '';
  const babySex = savedOrder?.babySex || '';
  const babyNameBoy = savedOrder?.babyNameBoy || '';
  const babyNameGirl = savedOrder?.babyNameGirl || '';

  // Formatar valor
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 79.99;
  const formattedAmount = `R$ ${numericAmount.toFixed(2).replace('.', ',')}`;

  // Preparar WhatsApp link
  const whatsappClean = String(finalCustomerPhone).replace(/\D/g, '');
  const whatsappLink = whatsappClean ? `https://wa.me/55${whatsappClean}` : '#';

  // Formatar letra para HTML
  const lyricsHtml = approved_lyrics ? approved_lyrics.replace(/\n/g, '<br>') : '';

  // Verificar se é chá revelação
  const isChaRevelacao = relationship === 'cha-revelacao' || occasion === 'cha-revelacao';

  // Info sobre dados recebidos vs salvos
  const dataSourceInfo = savedOrder
    ? '✅ Dados completos do formulário encontrados'
    : '⚠️ Dados do formulário não encontrados - usando dados da Cakto';

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
        .section-orange { border-left-color: #f97316; }
        .section-title { font-weight: bold; color: #059669; margin-bottom: 15px; font-size: 16px; }
        .amount { font-size: 36px; font-weight: bold; color: #059669; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; white-space: pre-wrap; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
        .info-row { margin: 8px 0; }
        .label { color: #6b7280; }
        .baby-box { background: linear-gradient(135deg, #fce7f3, #dbeafe); padding: 15px; border-radius: 8px; margin: 10px 0; }
        .debug-box { background: #fef3c7; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 12px; overflow-x: auto; }
        .warning { background: #fef3c7; border-left-color: #f97316; }
        .success { background: #d1fae5; border-left-color: #10b981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 NOVO PEDIDO - CAKTO</h1>
          <div class="badge">Pagamento Confirmado via ${paymentMethod}</div>
        </div>

        <div class="content">
          <div class="section ${savedOrder ? 'success' : 'warning'}">
            <div class="section-title">${savedOrder ? '✅' : '⚠️'} Status dos Dados</div>
            <p>${dataSourceInfo}</p>
            ${src ? `<p><strong>Order ID:</strong> ${src}</p>` : '<p>Order ID não encontrado na requisição</p>'}
          </div>

          <div class="section">
            <div class="section-title">💰 Pagamento</div>
            <p class="amount">${formattedAmount}</p>
            <p class="info-row"><span class="label">ID Transação:</span> ${transactionId}</p>
            <p class="info-row"><span class="label">Método:</span> ${paymentMethod}</p>
          </div>

          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <p class="info-row"><strong>Nome:</strong> ${finalCustomerName}</p>
            <p class="info-row"><strong>Email:</strong> ${finalCustomerEmail || 'Não informado'}</p>
            <p class="info-row"><strong>WhatsApp:</strong> ${finalCustomerPhone || 'Não informado'}</p>
            ${whatsappClean ? `<a href="${whatsappLink}" class="whatsapp-btn">💬 Abrir WhatsApp</a>` : ''}
          </div>

          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <p class="info-row"><strong>Música para:</strong> ${honoree_name}</p>
            <p class="info-row"><strong>Relacionamento:</strong> ${relationshipLabel}</p>
            <p class="info-row"><strong>Ocasião:</strong> ${occasionLabel}</p>
            <p class="info-row"><strong>Estilo Musical:</strong> ${musicStyleLabel}</p>
            <p class="info-row"><strong>Preferência de Voz:</strong> ${voice_preference === 'feminina' ? 'Feminina' : voice_preference === 'masculina' ? 'Masculina' : voice_preference || 'Sem preferência'}</p>
          </div>

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
          ` : `
          <div class="section section-orange">
            <div class="section-title" style="color: #f97316;">⚠️ Letra não encontrada</div>
            <p>A letra não foi encontrada nos dados do pedido. Pode ser necessário verificar com o cliente.</p>
          </div>
          `}

          <div class="section section-orange">
            <div class="section-title" style="color: #f97316;">🔍 Debug - Dados Recebidos da Cakto</div>
            <div class="debug-box">
              <pre>${JSON.stringify(body, null, 2).substring(0, 2000)}${JSON.stringify(body).length > 2000 ? '...(truncado)' : ''}</pre>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Enviar email para admin
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ['cantosdememorias@gmail.com'],
      subject: `🎵 NOVO PEDIDO CAKTO: ${finalCustomerName} → ${honoree_name} - ${formattedAmount}`,
      html: emailHtml,
    });
    console.log('✅ Email admin enviado com sucesso!');
  } catch (emailError) {
    console.error('❌ Erro ao enviar email admin:', emailError);
  }

  // Enviar email de confirmação para o cliente
  if (finalCustomerEmail && finalCustomerEmail.includes('@')) {
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

            <p>Recebemos seu pedido de música personalizada${honoree_name !== 'Não informado' ? ` para <strong>${honoree_name}</strong>` : ''}!</p>

            <div class="highlight">
              <p><strong>📋 Resumo do Pedido:</strong></p>
              <p>Valor: <strong>${formattedAmount}</strong></p>
              ${occasionLabel !== 'Não informado' ? `<p>Ocasião: ${occasionLabel}</p>` : ''}
              ${musicStyleLabel !== 'Não informado' ? `<p>Estilo: ${musicStyleLabel}</p>` : ''}
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
        from: FROM_EMAIL,
        to: [finalCustomerEmail],
        subject: `🎵 Pedido Confirmado - Sua música está sendo criada!`,
        html: clientEmailHtml,
      });
      console.log('✅ Email cliente enviado com sucesso!');
    } catch (emailError) {
      console.error('❌ Erro ao enviar email cliente:', emailError);
    }
  }
}

// Função auxiliar para extrair SRC de URLs ou outros campos
function extractSrcFromUrl(body: any): string {
  // Tentar encontrar em qualquer campo que possa conter URL
  const possibleUrls = [
    body.checkout_url,
    body.redirect_url,
    body.return_url,
    body.callback_url
  ];

  for (const url of possibleUrls) {
    if (url && typeof url === 'string') {
      const match = url.match(/[?&]src=(ORD-[^&]+)/);
      if (match) return match[1];
    }
  }

  return '';
}

// GET para verificar se o endpoint está ativo
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Webhook Cakto está funcionando',
    kv_available: kv !== null,
    timestamp: new Date().toISOString()
  });
}
