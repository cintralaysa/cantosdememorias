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
      // Verificar se notificação já foi enviada (evitar duplicatas de QStash + callback)
      const orderCheck = await getOrder(orderId);
      const alreadyNotified = orderCheck?.musicCompletedAt &&
        (Date.now() - new Date(orderCheck.musicCompletedAt).getTime()) > 5000;
      if (!alreadyNotified) {
        await sendMusicReadyNotifications(orderId);
      } else {
        console.log(`[MUSIC-POLL] Notificação já enviada para ${orderId}, pulando`);
      }
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

// Helper: base URL com www
function getEmailBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cantosdememorias.com.br').trim()
    .replace('://cantosdememorias.com.br', '://www.cantosdememorias.com.br');
}

// Enviar email "Sua música está pronta!" para o cliente
async function sendMusicReadyNotifications(orderId: string) {
  const order = await getOrder(orderId);
  if (!order) return;

  const baseUrl = getEmailBaseUrl();
  const musicPageUrl = `${baseUrl}/musica/${orderId}`;
  const accessCode = order.accessCode || '';
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cantos de Memórias <onboarding@resend.dev>';
  const musicUrls = order.musicUrls ? JSON.parse(String(order.musicUrls)) : [];
  const melodiasCount = musicUrls.length || 2;

  // Email para o cliente
  if (order.customerEmail) {
    const lyrics = order.generatedLyrics || order.approvedLyrics || '';

    const emailHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0edf6;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:16px;">
    <!-- Header com gradiente -->
    <div style="background:linear-gradient(135deg,#4c1d95,#7c3aed,#a855f7);border-radius:20px 20px 0 0;padding:40px 30px;text-align:center;">
      <div style="width:72px;height:72px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:36px;line-height:72px;">&#127925;</span>
      </div>
      <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px;">Sua Música Está Pronta!</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0;">Música personalizada para <strong>${order.honoreeName}</strong></p>
    </div>

    <!-- Corpo -->
    <div style="background:#fff;padding:32px 28px;border-radius:0 0 20px 20px;box-shadow:0 8px 24px rgba(124,58,237,0.12);">
      <p style="color:#374151;font-size:15px;margin:0 0 20px;">Olá <strong style="color:#4c1d95;">${order.customerName}</strong>,</p>

      <!-- Box de sucesso -->
      <div style="background:linear-gradient(135deg,#f5f3ff,#fdf2f8);border:1px solid #e9d5ff;border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
        <div style="font-size:48px;margin-bottom:8px;">&#127881;</div>
        <h2 style="color:#4c1d95;font-size:20px;font-weight:800;margin:0 0 8px;">Ficou incrível!</h2>
        <p style="color:#6b7280;font-size:14px;margin:0;">Criamos <strong style="color:#7c3aed;">${melodiasCount} melodias</strong> exclusivas para você.</p>
        <p style="color:#6b7280;font-size:13px;margin:8px 0 0;">Ouça, escolha sua favorita e baixe o MP3.</p>
      </div>

      <!-- Botão principal -->
      <div style="text-align:center;margin:0 0 24px;">
        <a href="${musicPageUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:800;font-size:16px;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(124,58,237,0.35);">
          &#9654;&#65039; Ouvir e Baixar Músicas
        </a>
      </div>

      ${accessCode ? `
      <!-- Código de acesso -->
      <div style="background:#faf5ff;border:2px dashed #c4b5fd;border-radius:14px;padding:20px;text-align:center;margin:0 0 24px;">
        <p style="color:#7c3aed;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Seu Código de Acesso</p>
        <div style="font-size:28px;font-weight:900;font-family:'Courier New',monospace;color:#4c1d95;letter-spacing:4px;margin:0 0 8px;">${accessCode}</div>
        <p style="color:#9ca3af;font-size:11px;margin:0;">Guarde este código para acessar suas músicas a qualquer momento</p>
      </div>
      ` : ''}

      ${lyrics ? `
      <!-- Letra -->
      <div style="border-radius:14px;overflow:hidden;margin:0 0 24px;border:1px solid #e5e7eb;">
        <div style="background:#f9fafb;padding:12px 16px;border-bottom:1px solid #e5e7eb;">
          <p style="margin:0;color:#4c1d95;font-size:13px;font-weight:700;">&#128221; Letra da sua música</p>
        </div>
        <div style="padding:16px;background:#fff;">
          <pre style="white-space:pre-wrap;font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#4b5563;margin:0;line-height:1.9;">${lyrics}</pre>
        </div>
      </div>
      ` : ''}

      <!-- Dica importante -->
      <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 6px;font-weight:700;color:#92400e;font-size:13px;">&#128161; Dica importante</p>
        <p style="margin:0;color:#78350f;font-size:12px;line-height:1.6;">Clique no botão acima para ouvir as melodias e baixar o MP3. O link fica disponível por <strong>30 dias</strong>, então salve o arquivo no celular ou computador!</p>
      </div>

      <!-- WhatsApp -->
      <div style="text-align:center;margin:0 0 8px;">
        <p style="color:#9ca3af;font-size:12px;margin:0 0 12px;">Ficou com dúvida? Fale com a gente!</p>
        <a href="https://wa.me/5588992422920" style="display:inline-block;background:#25D366;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:13px;">
          &#128172; WhatsApp
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px 0 8px;">
      <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">&#127925; Cantos de Memórias</p>
      <p style="color:#d1d5db;font-size:11px;margin:0;">Transformando sentimentos em música</p>
    </div>
  </div>
</body>
</html>`;

    try {
      await getResend()?.emails.send({
        from: FROM_EMAIL,
        to: [order.customerEmail],
        subject: `Sua música está pronta! - ${order.honoreeName}`,
        html: emailHtml,
      });
      console.log(`[MUSIC-POLL] Email "música pronta" enviado para: ${order.customerEmail}`);
    } catch (e) {
      console.error('[MUSIC-POLL] Erro ao enviar email ao cliente:', e);
    }
  }

  // Email para admin (monitoramento)
  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: ['cantosdememorias@gmail.com'],
      subject: `MUSICA GERADA: ${order.customerName} > ${order.honoreeName} [${order.orderId}]`,
      html: `<h2>Musica gerada automaticamente!</h2>
        <p><strong>Pedido:</strong> ${order.orderId}</p>
        <p><strong>Cliente:</strong> ${order.customerName} (${order.customerEmail})</p>
        <p><strong>Para:</strong> ${order.honoreeName}</p>
        <p><strong>Plano:</strong> ${order.plan}</p>
        <p><strong>Melodias:</strong> ${musicUrls.length} arquivo(s)</p>
        <p><strong>Pagina:</strong> <a href="${musicPageUrl}">${musicPageUrl}</a></p>
        <p><strong>Codigo:</strong> ${accessCode}</p>
        ${musicUrls.map((url: string, i: number) => `<p><a href="${url}">Melodia ${i + 1}</a></p>`).join('')}
      `,
    });
    console.log('[MUSIC-POLL] Email de monitoramento enviado ao admin');
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
