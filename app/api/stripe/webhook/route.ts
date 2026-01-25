import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getOrder, updateOrderStatus } from '@/lib/orderStore';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = 'Cantos de Memórias <contato@cantosdememorias.com.br>';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    // Se tiver webhook secret configurado, verifica a assinatura
    if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('Erro na verificação do webhook:', err);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
      }
    } else {
      // Em desenvolvimento ou sem webhook secret, aceita o evento diretamente
      event = JSON.parse(body);
    }

    // Processar evento de pagamento bem-sucedido
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;

      if (orderId) {
        // Buscar dados do pedido
        const orderData = await getOrder(orderId);

        if (orderData) {
          // Atualizar status do pedido
          await updateOrderStatus(orderId, 'paid');

          // Enviar email de confirmação
          if (resend) {
            try {
              // Email para o admin
              await resend.emails.send({
                from: FROM_EMAIL,
                to: ['cantosdememorias@gmail.com'],
                subject: `💳 CARTÃO PAGO: ${orderData.customerName} → ${orderData.honoreeName} [${orderId}]`,
                html: gerarEmailAdmin(orderData, orderId, session),
              });

              // Email para o cliente
              if (orderData.customerEmail) {
                await resend.emails.send({
                  from: FROM_EMAIL,
                  to: [orderData.customerEmail],
                  subject: `🎵 Pagamento Confirmado! Sua música está sendo criada`,
                  html: gerarEmailCliente(orderData, orderId),
                });
              }
            } catch (emailError) {
              console.error('Erro ao enviar emails:', emailError);
            }
          }

          console.log(`✅ Pagamento Stripe confirmado: ${orderId}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook Stripe:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}

function gerarEmailAdmin(orderData: any, orderId: string, session: Stripe.Checkout.Session) {
  const lyricsHtml = orderData.generatedLyrics
    ? orderData.generatedLyrics.replace(/\n/g, '<br>')
    : 'Letra não gerada ainda';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-bottom: 20px; }
        .info-grid { display: grid; gap: 15px; }
        .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #6366f1; }
        .info-label { font-weight: bold; color: #6366f1; font-size: 12px; text-transform: uppercase; }
        .info-value { color: #333; margin-top: 5px; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 20px; white-space: pre-wrap; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Pagamento via Cartão Confirmado!</h1>
          <p>Pedido #${orderId}</p>
        </div>
        <div class="content">
          <div class="badge">✅ PAGO - CARTÃO DE CRÉDITO</div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Cliente</div>
              <div class="info-value">${orderData.customerName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">WhatsApp</div>
              <div class="info-value">${orderData.customerWhatsapp}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${orderData.customerEmail}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Homenageado</div>
              <div class="info-value">${orderData.honoreeName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Plano</div>
              <div class="info-value">${orderData.plan === 'premium' ? 'Premium (2 músicas)' : 'Básico (1 música)'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Valor</div>
              <div class="info-value">R$ ${(orderData.amount / 100).toFixed(2)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Ocasião</div>
              <div class="info-value">${orderData.occasionLabel || orderData.occasion}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estilo Musical</div>
              <div class="info-value">${orderData.styleLabel || orderData.style}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Prazo de Entrega</div>
              <div class="info-value">${orderData.plan === 'premium' ? 'No mesmo dia ⚡' : 'Até 24 horas'}</div>
            </div>
          </div>

          <h3>📝 Letra Gerada:</h3>
          <div class="lyrics-box">${lyricsHtml}</div>

          <h3>📖 História:</h3>
          <div class="info-item">
            <div class="info-value">${orderData.story || 'Não informada'}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function gerarEmailCliente(orderData: any, orderId: string) {
  const lyricsHtml = orderData.generatedLyrics
    ? orderData.generatedLyrics.replace(/\n/g, '<br>')
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .highlight-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .lyrics-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 20px; white-space: pre-wrap; font-style: italic; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 Pagamento Confirmado!</h1>
          <p>Sua música está sendo criada com carinho</p>
        </div>
        <div class="content">
          <p>Olá, <strong>${orderData.customerName}</strong>!</p>

          <div class="highlight-box">
            <strong>✅ Pagamento aprovado com sucesso!</strong><br><br>
            Recebemos seu pedido e já estamos trabalhando na música personalizada para <strong>${orderData.honoreeName}</strong>.
          </div>

          <p><strong>Detalhes do pedido:</strong></p>
          <ul>
            <li>Pedido: #${orderId}</li>
            <li>Plano: ${orderData.plan === 'premium' ? 'Premium (2 músicas)' : 'Básico (1 música)'}</li>
            <li>Prazo de entrega: ${orderData.plan === 'premium' ? 'No mesmo dia' : 'Até 24 horas'}</li>
          </ul>

          ${orderData.generatedLyrics ? `
          <h3>📝 Letra da sua música:</h3>
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
}
