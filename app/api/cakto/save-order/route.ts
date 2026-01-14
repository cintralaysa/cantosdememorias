import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Tentar importar KV, mas funcionar sem ele se não estiver disponível
let kv: any = null;
try {
  kv = require('@vercel/kv').kv;
} catch (e) {
  console.log('Vercel KV não disponível, continuando sem persistência');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cantos de Memórias <onboarding@resend.dev>';

// Endpoint para salvar dados do pedido antes de redirecionar para Cakto
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Gerar ID único do pedido
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Tentar salvar no KV se disponível
    if (kv) {
      try {
        await kv.set(`cakto_order:${orderId}`, JSON.stringify({
          ...orderData,
          orderId,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }), { ex: 604800 }); // 7 dias
        console.log('Pedido salvo no KV:', orderId);
      } catch (kvError) {
        console.log('KV não disponível, continuando sem persistência:', kvError);
      }
    }

    // ENVIAR EMAIL IMEDIATO com dados do pedido (AGUARDANDO PAGAMENTO)
    await sendOrderEmail(orderData, orderId, 'pending');

    // Construir URL do checkout Cakto com dados pré-preenchidos
    const checkoutUrl = buildCheckoutUrl(orderData, orderId);

    console.log('=== PEDIDO PARA CAKTO ===');
    console.log('Order ID:', orderId);
    console.log('Cliente:', orderData.customerName);
    console.log('Homenageado:', orderData.honoreeName);
    console.log('Checkout URL:', checkoutUrl);

    return NextResponse.json({
      success: true,
      orderId,
      checkoutUrl
    });
  } catch (error) {
    console.error('Erro ao processar pedido Cakto:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pedido' },
      { status: 500 }
    );
  }
}

async function sendOrderEmail(orderData: any, orderId: string, status: 'pending' | 'paid') {
  const isPending = status === 'pending';

  // Formatar letra para HTML
  const lyricsHtml = orderData.generatedLyrics ? orderData.generatedLyrics.replace(/\n/g, '<br>') : '';

  // Verificar se é chá revelação
  const isChaRevelacao = orderData.relationship === 'cha-revelacao' || orderData.occasion === 'cha-revelacao';

  // WhatsApp link
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
        .label { color: #6b7280; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; white-space: pre-wrap; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; }
        .baby-box { background: linear-gradient(135deg, #fce7f3, #dbeafe); padding: 15px; border-radius: 8px; margin: 10px 0; }
        .warning-box { background: #fef3c7; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 ${isPending ? 'NOVO PEDIDO - AGUARDANDO PAGAMENTO' : 'PAGAMENTO CONFIRMADO'}</h1>
          <div class="badge">${isPending ? '⏳ Cliente indo para checkout' : '✅ Pagamento aprovado'}</div>
        </div>

        <div class="content">
          ${isPending ? `
          <div class="warning-box">
            <strong>⚠️ ATENÇÃO:</strong> Este pedido ainda NÃO foi pago. O cliente está sendo redirecionado para o checkout da Cakto. Você receberá outro email quando o pagamento for confirmado.
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

  // Enviar email para admin
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ['cantosdememorias@gmail.com'],
      subject: `🎵 ${isPending ? '⏳ AGUARDANDO PAGAMENTO' : '✅ PAGO'}: ${orderData.customerName} → ${orderData.honoreeName} [${orderId}]`,
      html: emailHtml,
    });
    console.log(`✅ Email ${status} enviado para admin!`);
  } catch (emailError) {
    console.error('❌ Erro ao enviar email admin:', emailError);
  }
}

function buildCheckoutUrl(orderData: any, orderId: string): string {
  const baseUrl = 'https://pay.cakto.com.br/oy9g4ou_722770';

  const params = new URLSearchParams();

  // Dados do cliente (pré-preenchidos no checkout)
  if (orderData.customerName) {
    params.append('name', orderData.customerName.trim());
  }
  if (orderData.customerEmail) {
    params.append('email', orderData.customerEmail.trim());
    params.append('confirmEmail', orderData.customerEmail.trim());
  }
  if (orderData.customerWhatsapp) {
    // Formatar telefone com código do país
    const phone = orderData.customerWhatsapp.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
    params.append('phone', formattedPhone);
  }

  // Passar orderId como parâmetro SRC para rastreamento
  params.append('src', orderId);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// GET para buscar pedido salvo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId obrigatório' }, { status: 400 });
    }

    if (!kv) {
      return NextResponse.json({ error: 'KV não disponível' }, { status: 503 });
    }

    const orderData = await kv.get(`cakto_order:${orderId}`);

    if (!orderData) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json(orderData);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 });
  }
}
