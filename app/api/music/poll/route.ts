import { NextRequest, NextResponse } from 'next/server';
import { pollMusicStatus } from '@/lib/musicGeneration';
import { getOrder } from '@/lib/orderStore';
import { Resend } from 'resend';

// Lazy init do Resend
let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// POST /api/music/poll — Chamado pelo QStash para verificar status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
    }

    console.log(`[MUSIC-POLL] Polling para: ${orderId}`);

    const result = await pollMusicStatus(orderId);

    if (result === 'completed') {
      // Música pronta! Enviar notificações
      await sendMusicReadyNotifications(orderId);
    } else if (result === 'failed') {
      // Geração falhou! Notificar admin
      await sendMusicFailedNotification(orderId);
    }

    return NextResponse.json({
      success: true,
      status: result,
      orderId,
    });

  } catch (error) {
    console.error('[MUSIC-POLL] Erro:', error);
    return NextResponse.json(
      { error: 'Erro no polling', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// Enviar email "Sua música está pronta!" para o cliente
async function sendMusicReadyNotifications(orderId: string) {
  const order = await getOrder(orderId);
  if (!order) return;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cantosdememorias.com.br';
  const musicPageUrl = `${baseUrl}/musica/${orderId}`;
  const accessCode = order.accessCode || '';
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cantos de Memórias <onboarding@resend.dev>';

  // Email para o cliente
  if (order.customerEmail) {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 40px 30px; border-radius: 15px 15px 0 0; text-align: center; }
          .content { background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .success-box { background: linear-gradient(135deg, #ede9fe, #fce7f3); padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; }
          .btn-primary { display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 15px 35px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 10px 5px; }
          .btn-whatsapp { display: inline-block; background: #25D366; color: white; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; margin: 10px 5px; }
          .access-code { background: #f3f4f6; border: 2px dashed #d1d5db; padding: 15px; border-radius: 10px; text-align: center; margin: 20px 0; }
          .code { font-size: 24px; font-weight: bold; font-family: monospace; color: #7c3aed; letter-spacing: 3px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div style="font-size: 48px;">🎉🎵</div>
            <h1 style="margin: 10px 0 0;">Sua música está pronta!</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Música para ${order.honoreeName}</p>
          </div>
          <div class="content">
            <p>Olá <strong>${order.customerName}</strong>,</p>
            <div class="success-box">
              <h2 style="color: #7c3aed; margin: 0;">Parabéns! Sua música foi gerada com sucesso!</h2>
              <p>A música de <strong>${order.honoreeName}</strong> está pronta para você ouvir e baixar.</p>
            </div>
            <div style="text-align: center;">
              <a href="${musicPageUrl}" class="btn-primary">🎵 Ouvir e Baixar Música</a>
            </div>
            ${accessCode ? `
            <div class="access-code">
              <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">Seu código de acesso:</p>
              <div class="code">${accessCode}</div>
              <p style="margin: 5px 0 0; color: #9ca3af; font-size: 12px;">Guarde este código! Use-o para acessar suas músicas por até 30 dias.</p>
            </div>
            ` : ''}
            <p>Qualquer dúvida, estamos à disposição!</p>
            <div style="text-align: center;">
              <a href="https://wa.me/5588992422920" class="btn-whatsapp">💬 Falar no WhatsApp</a>
            </div>
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
        to: [order.customerEmail],
        subject: `🎵 Sua música está pronta! - ${order.honoreeName} - Cantos de Memórias`,
        html: emailHtml,
      });
      console.log(`[MUSIC-POLL] ✅ Email "música pronta" enviado para: ${order.customerEmail}`);
    } catch (e) {
      console.error('[MUSIC-POLL] Erro ao enviar email ao cliente:', e);
    }
  }

  // Email para admin (monitoramento)
  try {
    const musicUrls = order.musicUrls ? JSON.parse(String(order.musicUrls)) : [];
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: ['cantosdememorias@gmail.com'],
      subject: `🎵 ✅ MÚSICA GERADA: ${order.customerName} → ${order.honoreeName} [${order.orderId}]`,
      html: `<h2>Música gerada automaticamente!</h2>
        <p><strong>Pedido:</strong> ${order.orderId}</p>
        <p><strong>Cliente:</strong> ${order.customerName}</p>
        <p><strong>Para:</strong> ${order.honoreeName}</p>
        <p><strong>Plano:</strong> ${order.plan}</p>
        <p><strong>Músicas:</strong> ${musicUrls.length} arquivo(s)</p>
        <p><strong>Página:</strong> <a href="${musicPageUrl}">${musicPageUrl}</a></p>
        <p><strong>Código:</strong> ${accessCode}</p>
        ${musicUrls.map((url: string, i: number) => `<p><a href="${url}">🎵 Música ${i + 1}</a></p>`).join('')}
      `,
    });
    console.log('[MUSIC-POLL] ✅ Email de monitoramento enviado ao admin');
  } catch (e) {
    console.error('[MUSIC-POLL] Erro ao enviar email admin:', e);
  }
}

// Notificar admin sobre falha na geração
async function sendMusicFailedNotification(orderId: string) {
  const order = await getOrder(orderId);
  if (!order) return;

  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cantos de Memórias <onboarding@resend.dev>';
  const whatsappClean = (order.customerWhatsapp || '').replace(/\D/g, '');

  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: ['cantosdememorias@gmail.com'],
      subject: `❌ FALHA NA GERAÇÃO: ${order.customerName} → ${order.honoreeName} [${order.orderId}]`,
      html: `<h2 style="color: red;">⚠️ Geração de música falhou!</h2>
        <p>O sistema automático não conseguiu gerar a música. <strong>Ação manual necessária.</strong></p>
        <hr>
        <p><strong>Pedido:</strong> ${order.orderId}</p>
        <p><strong>Cliente:</strong> ${order.customerName}</p>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/55${whatsappClean}">${order.customerWhatsapp}</a></p>
        <p><strong>Para:</strong> ${order.honoreeName}</p>
        <p><strong>Estilo:</strong> ${order.musicStyleLabel || order.musicStyle}</p>
        <p><strong>Erro:</strong> ${order.musicError || 'Desconhecido'}</p>
        <hr>
        <p>Entre em contato com o cliente e faça a música manualmente.</p>
      `,
    });
    console.log('[MUSIC-POLL] ✅ Email de falha enviado ao admin');
  } catch (e) {
    console.error('[MUSIC-POLL] Erro ao enviar email de falha:', e);
  }
}
