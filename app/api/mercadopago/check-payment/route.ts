import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getOrder, removeOrder } from '@/lib/orderStore';

const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-4063235147276146-122919-dd71f6ad2dc03550ecfc7e57767900a9-3101728620';

const mercadopagoConfig = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
  options: { timeout: 30000 }
});

// Interface para os dados do pedido do metadata
interface OrderMetadata {
  order_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_whatsapp?: string;
  honoree_name?: string;
  relationship?: string;
  occasion?: string;
  music_style?: string;
  voice_preference?: string;
  qualities?: string;
  memories?: string;
  heart_message?: string;
  family_names?: string;
  approved_lyrics?: string;
  knows_baby_sex?: string;
  baby_sex?: string;
  baby_name_boy?: string;
  baby_name_girl?: string;
}

// Função para enviar email de confirmação para o CLIENTE
async function sendCustomerConfirmationEmail(data: {
  amount: number;
  customerName: string;
  customerEmail: string;
  honoreeName: string;
  occasion: string;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';

  if (!RESEND_API_KEY || !data.customerEmail) {
    console.log('[CHECK-PAYMENT] Sem API key ou email do cliente');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 800; }
        .header p { margin: 15px 0 0 0; opacity: 0.9; font-size: 16px; }
        .emoji-big { font-size: 60px; margin-bottom: 20px; }
        .content { padding: 40px 30px; }
        .success-badge { background: #10b981; color: white; display: inline-block; padding: 10px 25px; border-radius: 30px; font-weight: bold; font-size: 14px; margin-bottom: 25px; }
        .info-card { background: #f8f5ff; padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 4px solid #8b5cf6; }
        .info-card h3 { margin: 0 0 15px 0; color: #7c3aed; font-size: 16px; }
        .info-card p { margin: 8px 0; color: #555; }
        .timeline { margin: 30px 0; }
        .timeline-item { display: flex; align-items: flex-start; margin: 20px 0; }
        .timeline-icon { width: 40px; height: 40px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
        .timeline-content h4 { margin: 0 0 5px 0; color: #333; font-size: 15px; }
        .timeline-content p { margin: 0; color: #666; font-size: 14px; }
        .cta-section { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; border-radius: 15px; text-align: center; margin: 25px 0; }
        .cta-section p { margin: 0; color: #92400e; font-weight: 600; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 5px 0; color: #6b7280; font-size: 13px; }
        .footer a { color: #8b5cf6; text-decoration: none; }
        .amount { font-size: 32px; font-weight: 800; color: #10b981; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="emoji-big">🎵</div>
          <h1>Pagamento Confirmado!</h1>
          <p>Obrigado por escolher a Cantos de Memórias</p>
        </div>

        <div class="content">
          <div style="text-align: center;">
            <span class="success-badge">✓ PAGAMENTO APROVADO</span>
            <p class="amount">R$ ${data.amount.toFixed(2).replace('.', ',')}</p>
          </div>

          <p style="font-size: 18px; text-align: center; margin: 25px 0;">
            Olá, <strong>${data.customerName || 'Cliente'}</strong>! 🎉
          </p>

          <p style="text-align: center; color: #555;">
            Recebemos seu pedido e já estamos trabalhando na sua música personalizada para <strong>${data.honoreeName}</strong>.
          </p>

          <div class="info-card">
            <h3>📋 Resumo do seu pedido</h3>
            <p><strong>Música para:</strong> ${data.honoreeName}</p>
            <p><strong>Ocasião:</strong> ${data.occasion}</p>
            <p><strong>Valor pago:</strong> R$ ${data.amount.toFixed(2).replace('.', ',')}</p>
          </div>

          <h3 style="color: #7c3aed; margin-top: 35px;">📅 Próximos passos:</h3>

          <div class="timeline">
            <div class="timeline-item">
              <div class="timeline-icon">1</div>
              <div class="timeline-content">
                <h4>Produção da sua música</h4>
                <p>Nossa equipe já está criando sua música exclusiva com todo carinho.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-icon">2</div>
              <div class="timeline-content">
                <h4>Contato via WhatsApp</h4>
                <p>Você receberá uma mensagem confirmando os detalhes.</p>
              </div>
            </div>
            <div class="timeline-item">
              <div class="timeline-icon">3</div>
              <div class="timeline-content">
                <h4>Entrega em até 24 horas</h4>
                <p>Você receberá 2 melodias exclusivas no seu email e WhatsApp!</p>
              </div>
            </div>
          </div>

          <div class="cta-section">
            <p>🎁 Você receberá: 1 letra exclusiva + 2 melodias diferentes!</p>
          </div>

        </div>

        <div class="footer">
          <p><strong>Cantos de Memórias</strong></p>
          <p>Eternizando momentos especiais em música</p>
          <p style="margin-top: 15px;">
            Dúvidas? Entre em contato: <a href="mailto:cantosdememorias@gmail.com">cantosdememorias@gmail.com</a>
          </p>
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
        to: [data.customerEmail],
        subject: `🎵 Pedido Confirmado! Sua música para ${data.honoreeName} está sendo criada`,
        html: htmlContent,
      }),
    });

    if (response.ok) {
      console.log('[CHECK-PAYMENT] ✅ Email enviado para cliente:', data.customerEmail);
      return true;
    } else {
      const error = await response.json();
      console.error('[CHECK-PAYMENT] Erro ao enviar email:', error);
      return false;
    }
  } catch (error) {
    console.error('[CHECK-PAYMENT] Erro ao enviar email:', error);
    return false;
  }
}

// Função para enviar email COMPLETO para o ADMIN (com todos os dados do pedido)
async function sendFullOrderEmail(data: {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  orderData: any;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';
  const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

  if (!RESEND_API_KEY) return false;

  const order = data.orderData;
  const voiceLabel = order.voicePreference === 'feminina' ? 'Feminina' :
                     order.voicePreference === 'masculina' ? 'Masculina' : 'Sem preferência';

  let babySection = '';
  if (order.occasion?.toLowerCase().includes('chá') || order.occasion?.toLowerCase().includes('cha') ||
      order.occasion?.toLowerCase().includes('revelação') || order.occasion?.toLowerCase().includes('bebe') ||
      order.relationship === 'cha-revelacao' || order.relationshipLabel?.toLowerCase().includes('revelação')) {
    babySection = `
      <div class="section" style="border-left-color: #ec4899;">
        <div class="section-title">👶 Informações do Bebê</div>
        ${order.knowsBabySex === 'sim' ? `
          <p><strong>Sexo do bebê:</strong> ${order.babySex === 'menino' ? '💙 Menino' : '💖 Menina'}</p>
          <p><strong>Nome escolhido:</strong> ${order.babySex === 'menino' ? order.babyNameBoy : order.babyNameGirl}</p>
        ` : `
          <p><strong>Os pais não sabem o sexo ainda</strong></p>
          <p><strong>Se for menino:</strong> ${order.babyNameBoy || 'Não informado'}</p>
          <p><strong>Se for menina:</strong> ${order.babyNameGirl || 'Não informado'}</p>
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
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .section-title { font-weight: bold; color: #059669; margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .amount { font-size: 36px; font-weight: bold; color: #059669; margin: 10px 0; }
        .badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; background: #d1fae5; color: #065f46; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 NOVO PEDIDO PAGO!</h1>
          <p>Pagamento confirmado via ${data.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}</p>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">💰 Pagamento Confirmado</div>
            <p class="amount">R$ ${data.amount.toFixed(2).replace('.', ',')}</p>
            <p><span class="badge">${data.paymentMethod === 'pix' ? '✓ PIX' : '✓ Cartão'}</span></p>
            <p><strong>ID do Pagamento:</strong> ${data.paymentId}</p>
            <p><strong>ID do Pedido:</strong> ${order.orderId || 'N/A'}</p>
          </div>

          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <p><strong>Nome:</strong> ${order.customerName || 'N/A'}</p>
            <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
            <p><strong>WhatsApp:</strong> ${order.customerWhatsapp || 'N/A'}</p>
            ${order.customerWhatsapp ? `<a href="https://wa.me/55${order.customerWhatsapp.replace(/\D/g, '')}" class="whatsapp-btn">💬 Abrir WhatsApp</a>` : ''}
          </div>

          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <p><strong>Música para:</strong> ${order.honoreeName || 'N/A'}</p>
            <p><strong>Relacionamento:</strong> ${order.relationshipLabel || order.relationship || 'N/A'}</p>
            <p><strong>Ocasião:</strong> ${order.occasionLabel || order.occasion || 'N/A'}</p>
            <p><strong>Estilo Musical:</strong> ${order.musicStyleLabel || order.musicStyle || 'N/A'}</p>
            <p><strong>Preferência de Voz:</strong> ${voiceLabel}</p>
          </div>

          ${order.familyNames ? `
          <div class="section">
            <div class="section-title">👨‍👩‍👧‍👦 Familiares para Mencionar</div>
            <p>${order.familyNames}</p>
          </div>
          ` : ''}

          ${order.qualities ? `
          <div class="section">
            <div class="section-title">💝 Qualidades do Homenageado</div>
            <p>${order.qualities}</p>
          </div>
          ` : ''}

          ${order.memories ? `
          <div class="section">
            <div class="section-title">🎵 Memórias Especiais</div>
            <p>${order.memories}</p>
          </div>
          ` : ''}

          ${order.heartMessage ? `
          <div class="section">
            <div class="section-title">💌 Mensagem do Coração</div>
            <p>${order.heartMessage}</p>
          </div>
          ` : ''}

          ${babySection}

          ${order.approvedLyrics ? `
          <div class="section" style="border-left-color: #8b5cf6;">
            <div class="section-title">📝 LETRA APROVADA PELO CLIENTE</div>
            <div class="lyrics-box">${order.approvedLyrics}</div>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p><strong>Cantos de Memórias</strong></p>
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
        subject: `🎵 NOVO PEDIDO! ${order.honoreeName || 'Cliente'} - R$ ${data.amount.toFixed(2).replace('.', ',')} - ${order.occasionLabel || order.occasion || 'Música'}`,
        html: htmlContent,
      }),
    });

    if (response.ok) {
      console.log('[CHECK-PAYMENT] ✅ Email COMPLETO enviado para admin');
      return true;
    } else {
      const error = await response.json();
      console.error('[CHECK-PAYMENT] Erro ao enviar email completo:', error);
      return false;
    }
  } catch (error) {
    console.error('[CHECK-PAYMENT] Erro ao enviar email completo:', error);
    return false;
  }
}

// Função para enviar email para o ADMIN
async function sendAdminEmail(paymentData: {
  paymentId: string;
  amount: number;
  paymentMethod: string;
  metadata: OrderMetadata;
}) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_YZgURojb_2mv7v4jQgGBkev292bfTXS9M';
  const ADMIN_EMAIL = 'cantosdememorias@gmail.com';

  if (!RESEND_API_KEY) return false;

  const meta = paymentData.metadata;
  const voiceLabel = meta.voice_preference === 'feminina' ? 'Feminina' :
                     meta.voice_preference === 'masculina' ? 'Masculina' : 'Sem preferência';

  let babySection = '';
  if (meta.occasion?.toLowerCase().includes('chá') || meta.occasion?.toLowerCase().includes('cha') ||
      meta.occasion?.toLowerCase().includes('revelação') || meta.occasion?.toLowerCase().includes('bebe')) {
    babySection = `
      <div class="section" style="border-left-color: #ec4899;">
        <div class="section-title">👶 Informações do Bebê</div>
        ${meta.knows_baby_sex === 'sim' ? `
          <p><strong>Sexo do bebê:</strong> ${meta.baby_sex === 'menino' ? '💙 Menino' : '💖 Menina'}</p>
          <p><strong>Nome escolhido:</strong> ${meta.baby_sex === 'menino' ? meta.baby_name_boy : meta.baby_name_girl}</p>
        ` : `
          <p><strong>Os pais não sabem o sexo ainda</strong></p>
          <p><strong>Se for menino:</strong> ${meta.baby_name_boy || 'Não informado'}</p>
          <p><strong>Se for menina:</strong> ${meta.baby_name_girl || 'Não informado'}</p>
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
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }
        .section-title { font-weight: bold; color: #059669; margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .amount { font-size: 36px; font-weight: bold; color: #059669; margin: 10px 0; }
        .badge { display: inline-block; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; background: #d1fae5; color: #065f46; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-style: italic; line-height: 1.8; border: 1px solid #fcd34d; }
        .whatsapp-btn { display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 NOVO PEDIDO PAGO!</h1>
          <p>Você recebeu um novo pedido de música personalizada</p>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">💰 Pagamento Confirmado</div>
            <p class="amount">R$ ${paymentData.amount.toFixed(2).replace('.', ',')}</p>
            <p><span class="badge">${paymentData.paymentMethod === 'pix' ? '✓ PIX' : '✓ Cartão'}</span></p>
            <p><strong>ID do Pagamento:</strong> ${paymentData.paymentId}</p>
            <p><strong>ID do Pedido:</strong> ${meta.order_id || 'N/A'}</p>
          </div>

          <div class="section">
            <div class="section-title">👤 Dados do Cliente</div>
            <p><strong>Nome:</strong> ${meta.customer_name || 'Não informado'}</p>
            <p><strong>Email:</strong> ${meta.customer_email || 'Não informado'}</p>
            <p><strong>WhatsApp:</strong> ${meta.customer_whatsapp || 'Não informado'}</p>
            ${meta.customer_whatsapp ? `<a href="https://wa.me/55${meta.customer_whatsapp.replace(/\D/g, '')}" class="whatsapp-btn">💬 Abrir WhatsApp</a>` : ''}
          </div>

          <div class="section">
            <div class="section-title">🎁 Detalhes do Pedido</div>
            <p><strong>Música para:</strong> ${meta.honoree_name || 'Não informado'}</p>
            <p><strong>Relacionamento:</strong> ${meta.relationship || 'Não informado'}</p>
            <p><strong>Ocasião:</strong> ${meta.occasion || 'Não informado'}</p>
            <p><strong>Estilo Musical:</strong> ${meta.music_style || 'Não informado'}</p>
            <p><strong>Preferência de Voz:</strong> ${voiceLabel}</p>
          </div>

          ${meta.family_names ? `
          <div class="section">
            <div class="section-title">👨‍👩‍👧‍👦 Familiares para Mencionar</div>
            <p>${meta.family_names}</p>
          </div>
          ` : ''}

          ${meta.qualities ? `
          <div class="section">
            <div class="section-title">💝 Qualidades do Homenageado</div>
            <p>${meta.qualities}</p>
          </div>
          ` : ''}

          ${meta.memories ? `
          <div class="section">
            <div class="section-title">🎵 Memórias Especiais</div>
            <p>${meta.memories}</p>
          </div>
          ` : ''}

          ${meta.heart_message ? `
          <div class="section">
            <div class="section-title">💌 Mensagem do Coração</div>
            <p>${meta.heart_message}</p>
          </div>
          ` : ''}

          ${babySection}

          ${meta.approved_lyrics ? `
          <div class="section" style="border-left-color: #8b5cf6;">
            <div class="section-title">📝 LETRA APROVADA PELO CLIENTE</div>
            <div class="lyrics-box">${meta.approved_lyrics}</div>
          </div>
          ` : ''}

        </div>

        <div class="footer">
          <p><strong>Cantos de Memórias</strong></p>
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
        subject: `🎵 NOVO PEDIDO! ${meta.honoree_name || 'Cliente'} - R$ ${paymentData.amount.toFixed(2).replace('.', ',')}`,
        html: htmlContent,
      }),
    });

    if (response.ok) {
      console.log('[CHECK-PAYMENT] ✅ Email enviado para admin');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[CHECK-PAYMENT] Erro ao enviar email admin:', error);
    return false;
  }
}

// Armazenar pedidos já processados para não enviar emails duplicados
const processedPayments = new Set<string>();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderId = searchParams.get('order');
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  console.log('[CHECK-PAYMENT] Verificando pagamento...');
  console.log('[CHECK-PAYMENT] orderId:', orderId);
  console.log('[CHECK-PAYMENT] paymentId:', paymentId);
  console.log('[CHECK-PAYMENT] externalReference:', externalReference);

  try {
    // Se temos payment_id direto (retorno do Mercado Pago)
    if (paymentId) {
      const paymentClient = new Payment(mercadopagoConfig);
      const payment = await paymentClient.get({ id: Number(paymentId) });

      console.log('[CHECK-PAYMENT] Status:', payment.status);
      console.log('[CHECK-PAYMENT] Método:', payment.payment_method_id);

      const isApproved = payment.status === 'approved';
      const metadata = (payment.metadata || {}) as OrderMetadata;

      // Se aprovado e ainda não processado, enviar emails
      if (isApproved && !processedPayments.has(paymentId)) {
        processedPayments.add(paymentId);

        const paymentMethod = payment.payment_method_id === 'pix' ? 'pix' : 'card';

        // Tentar buscar dados completos do orderStore primeiro
        const storedOrder = getOrder(paymentId);
        console.log('[CHECK-PAYMENT] Dados do orderStore:', storedOrder ? 'ENCONTRADO' : 'NÃO ENCONTRADO');

        if (storedOrder) {
          // Usar dados completos do orderStore (inclui letra!)
          console.log('[CHECK-PAYMENT] Usando dados completos do orderStore');

          await sendFullOrderEmail({
            paymentId: paymentId,
            amount: storedOrder.amount,
            paymentMethod,
            orderData: storedOrder,
          });

          // Enviar email para cliente
          if (storedOrder.customerEmail) {
            await sendCustomerConfirmationEmail({
              amount: storedOrder.amount,
              customerName: storedOrder.customerName || '',
              customerEmail: storedOrder.customerEmail,
              honoreeName: storedOrder.honoreeName || '',
              occasion: storedOrder.occasionLabel || storedOrder.occasion || 'Música Personalizada',
            });
          }

          // Remover do store após processar
          removeOrder(paymentId);
        } else {
          // Fallback: usar metadata do Mercado Pago (pode estar incompleto)
          console.log('[CHECK-PAYMENT] Usando metadata do Mercado Pago (fallback)');

          await sendAdminEmail({
            paymentId: paymentId,
            amount: payment.transaction_amount || 0,
            paymentMethod,
            metadata,
          });

          // Enviar email para cliente
          if (metadata.customer_email) {
            await sendCustomerConfirmationEmail({
              amount: payment.transaction_amount || 0,
              customerName: metadata.customer_name || '',
              customerEmail: metadata.customer_email,
              honoreeName: metadata.honoree_name || '',
              occasion: metadata.occasion || 'Música Personalizada',
            });
          }
        }
      }

      return NextResponse.json({
        status: payment.status,
        approved: isApproved,
        paymentId: paymentId,
        orderId: metadata.order_id || externalReference || orderId,
        amount: payment.transaction_amount,
        paymentMethod: payment.payment_method_id,
      });
    }

    // Se só temos orderId, buscar por external_reference
    // Isso é mais difícil sem um banco de dados, então retornamos pending
    return NextResponse.json({
      status: 'pending',
      approved: false,
      orderId: orderId || externalReference,
      message: 'Aguardando confirmação do pagamento',
    });

  } catch (error) {
    console.error('[CHECK-PAYMENT] Erro:', error);
    return NextResponse.json({
      status: 'error',
      approved: false,
      error: 'Erro ao verificar pagamento',
    }, { status: 500 });
  }
}
