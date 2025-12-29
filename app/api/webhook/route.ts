import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// E-mail para receber notificações de venda
const NOTIFICATION_EMAIL = 'cantosdememorias@gmail.com';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Processar evento de pagamento bem-sucedido
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const metadata = session.metadata || {};

    // Formatar dados do pedido
    const orderData = {
      // Dados do cliente
      userName: metadata.userName || 'N/A',
      whatsapp: metadata.whatsapp || 'N/A',
      email: metadata.email || 'N/A',

      // Dados do serviço
      serviceTitle: metadata.serviceTitle || 'N/A',
      serviceType: metadata.serviceType || 'N/A',

      // Dados do homenageado
      honoreeName: metadata.honoreeName || 'N/A',
      relationship: metadata.relationship || 'N/A',
      occasion: metadata.occasion || 'N/A',
      musicStyle: metadata.musicStyle || 'N/A',
      voicePreference: metadata.voicePreference || 'Sem preferência',

      // História
      qualities: metadata.qualities || 'Não informado',
      memories: metadata.memories || 'Não informado',
      heartMessage: metadata.heartMessage || 'Não informado',

      // Chá revelação
      knowsBabySex: metadata.knowsBabySex || '',
      babySex: metadata.babySex || '',
      babyNameBoy: metadata.babyNameBoy || '',
      babyNameGirl: metadata.babyNameGirl || '',

      // Dados do pagamento
      amount: session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00',
      paymentStatus: session.payment_status,
      sessionId: session.id,
    };

    // Enviar notificação por e-mail
    await sendEmailNotification(orderData);

    console.log('Pedido processado:', orderData);
  }

  return NextResponse.json({ received: true });
}

async function sendEmailNotification(orderData: any) {
  // Construir informações do chá revelação se aplicável
  let chaRevelacaoInfo = '';
  if (orderData.occasion === 'Chá Revelação') {
    if (orderData.knowsBabySex === 'sim') {
      chaRevelacaoInfo = `

🍼 DETALHES DO CHÁ REVELAÇÃO:
- Já sabe o sexo: SIM
- Sexo do bebê: ${orderData.babySex === 'menino' ? 'MENINO 💙' : 'MENINA 💖'}
- Nome do bebê: ${orderData.babySex === 'menino' ? orderData.babyNameBoy : orderData.babyNameGirl}`;
    } else if (orderData.knowsBabySex === 'nao') {
      chaRevelacaoInfo = `

🍼 DETALHES DO CHÁ REVELAÇÃO:
- Já sabe o sexo: NÃO (criar 2 versões!)
- Nome se for Menino: ${orderData.babyNameBoy} 💙
- Nome se for Menina: ${orderData.babyNameGirl} 💖
⚠️ ATENÇÃO: Criar DUAS músicas, uma para cada possibilidade!`;
    }
  }

  const emailBody = `
🎉 NOVA VENDA - CANTOS DE MEMÓRIAS! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 VALOR: R$ ${orderData.amount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 SERVIÇO: ${orderData.serviceTitle}
${orderData.serviceType === 'music' ? '🎵 Tipo: Música Personalizada' : '🎙️ Tipo: Locução de Voz'}

👤 DADOS DO CLIENTE:
- Nome: ${orderData.userName}
- WhatsApp: ${orderData.whatsapp}
- E-mail: ${orderData.email || 'Não informado'}

💕 PARA QUEM É:
- Nome: ${orderData.honoreeName}
- Relação: ${orderData.relationship}
- Ocasião: ${orderData.occasion}
${orderData.serviceType !== 'voiceover' ? `- Estilo Musical: ${orderData.musicStyle}` : ''}
- Preferência de Voz: ${orderData.voicePreference}
${chaRevelacaoInfo}

📝 QUALIDADES/CARACTERÍSTICAS:
${orderData.qualities}

🎬 MEMÓRIAS ESPECIAIS:
${orderData.memories}

💌 MENSAGEM DO CORAÇÃO:
${orderData.heartMessage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 ID da Sessão: ${orderData.sessionId}
✅ Status: ${orderData.paymentStatus === 'paid' ? 'PAGO' : orderData.paymentStatus}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ Lembre-se: Entrega em até 24 horas!
${orderData.serviceType === 'music' ? '🎵 Enviar 2 melodias diferentes para o cliente escolher!' : '🎙️ Enviar 2 tons de voz diferentes para o cliente escolher!'}
`;

  // Usar o serviço de e-mail configurado
  // Por enquanto, vamos usar uma abordagem simples com a API Resend ou similar
  // Você pode substituir por qualquer serviço de e-mail

  try {
    // Se tiver Resend configurado:
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Cantos de Memórias <vendas@cantosdememorias.com>',
          to: [NOTIFICATION_EMAIL],
          subject: `🎉 Nova Venda! ${orderData.serviceTitle} - R$ ${orderData.amount}`,
          text: emailBody,
        }),
      });

      if (!response.ok) {
        console.error('Erro ao enviar e-mail via Resend:', await response.text());
      } else {
        console.log('E-mail de notificação enviado com sucesso!');
      }
    } else {
      // Fallback: logar no console se não tiver serviço de e-mail configurado
      console.log('='.repeat(60));
      console.log('NOTIFICAÇÃO DE VENDA (sem serviço de e-mail configurado):');
      console.log('='.repeat(60));
      console.log(emailBody);
      console.log('='.repeat(60));
      console.log('Configure RESEND_API_KEY no .env para receber e-mails');
    }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}
