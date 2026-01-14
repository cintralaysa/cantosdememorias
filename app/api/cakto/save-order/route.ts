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

    // ENVIAR EMAIL DE CONFIRMAÇÃO PARA O CLIENTE
    if (orderData.customerEmail) {
      await sendCustomerConfirmationEmail(orderData, orderId);
    }

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
        .btn { display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 15px 30px; border-radius: 30px; text-decoration: none; font-weight: bold; margin: 10px 0; }
        h2 { color: #7c3aed; margin-top: 25px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 Cantos de Memórias</h1>
          <p>Obrigado pelo seu pedido!</p>
        </div>

        <div class="content">
          <p>Olá <strong>${orderData.customerName || 'Cliente'}</strong>,</p>

          <p>Recebemos seu pedido de música personalizada! Estamos muito felizes em fazer parte desse momento especial.</p>

          <div class="highlight-box">
            <strong>⏳ Próximo passo:</strong> Complete o pagamento na página de checkout para confirmar seu pedido.
          </div>

          <h2>📋 Resumo do seu pedido</h2>
          <div class="order-details">
            <p><strong>Número do pedido:</strong> ${orderId}</p>
            <p><strong>Música para:</strong> ${orderData.honoreeName || 'N/A'}</p>
            <p><strong>Ocasião:</strong> ${orderData.occasionLabel || orderData.occasion || 'N/A'}</p>
            <p><strong>Estilo musical:</strong> ${orderData.musicStyleLabel || orderData.musicStyle || 'N/A'}</p>
          </div>

          ${lyricsHtml ? `
          <h2>📝 Letra da sua música</h2>
          <div class="lyrics-box">${lyricsHtml}</div>
          ` : ''}

          <div class="highlight-box">
            <strong>⏰ Prazo de entrega:</strong> Sua música personalizada será entregue em até <strong>48 horas</strong> após a confirmação do pagamento.
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <strong>Dúvidas?</strong> Fale conosco pelo WhatsApp:<br>
            <a href="https://wa.me/5511999999999" class="btn">💬 Falar no WhatsApp</a>
          </p>
        </div>

        <div class="footer">
          <p>🎵 Cantos de Memórias - Transformando sentimentos em música</p>
          <p>Este é um email automático, por favor não responda.</p>
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
