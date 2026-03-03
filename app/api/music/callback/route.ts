import { NextRequest, NextResponse } from 'next/server';
import { pollMusicStatus } from '@/lib/musicGeneration';
import { getOrderIdByTaskId, getOrder, updateOrder } from '@/lib/orderStore';
import { Resend } from 'resend';

let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

function getEmailBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cantosdememorias.com.br').trim()
    .replace('://cantosdememorias.com.br', '://www.cantosdememorias.com.br');
}

// POST /api/music/callback — Callback do Suno API quando a musica fica pronta
// Recebe taskId do Suno, mapeia para orderId, e dispara polling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[SUNO-CALLBACK] Recebido:', JSON.stringify(body).substring(0, 1000));

    // 1. Se vier orderId direto (chamada interna), usar
    let orderId = body.orderId;

    // 2. Se não tem orderId, tentar extrair taskId e buscar no Redis
    if (!orderId) {
      const taskId = body.taskId || body.data?.taskId;
      if (taskId) {
        console.log(`[SUNO-CALLBACK] Buscando orderId para taskId: ${taskId}`);
        orderId = await getOrderIdByTaskId(taskId);
        if (orderId) {
          console.log(`[SUNO-CALLBACK] Encontrado orderId: ${orderId} para taskId: ${taskId}`);
        } else {
          console.warn(`[SUNO-CALLBACK] orderId não encontrado para taskId: ${taskId}`);
        }
      }
    }

    if (orderId) {
      const result = await pollMusicStatus(orderId);
      console.log(`[SUNO-CALLBACK] Poll result for ${orderId}: ${result}`);

      // Se completou, enviar emails (mesmo check de dedup que o poll/route.ts)
      if (result === 'completed') {
        const order = await getOrder(orderId);
        if (order && !order.emailSentAt) {
          await updateOrder(orderId, { emailSentAt: new Date().toISOString() });
          await sendMusicReadyFromCallback(orderId, order);
        } else {
          console.log(`[SUNO-CALLBACK] Email já enviado para ${orderId}, pulando`);
        }
      }

      return NextResponse.json({ success: true, status: result, orderId });
    }

    // Se nao tem orderId nem taskId mapeável, logar para debug
    console.log('[SUNO-CALLBACK] Callback sem orderId/taskId mapeável - apenas log');
    return NextResponse.json({ success: true, message: 'Callback recebido (sem orderId)' });

  } catch (error) {
    console.error('[SUNO-CALLBACK] Erro:', error);
    return NextResponse.json({ error: 'Erro no callback' }, { status: 500 });
  }
}

// Enviar email "música pronta" a partir do callback
async function sendMusicReadyFromCallback(orderId: string, order: any) {
  const baseUrl = getEmailBaseUrl();
  const musicPageUrl = `${baseUrl}/musica/${orderId}`;
  const accessCode = order.accessCode || '';
  const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cantos de Memórias <contato@cantosdememorias.com.br>';
  const musicUrls = order.musicUrls ? JSON.parse(String(order.musicUrls)) : [];
  const melodiasCount = musicUrls.length || 2;

  // Email para cliente + admin
  if (order.customerEmail) {
    const lyrics = order.generatedLyrics || order.approvedLyrics || '';
    const ADMIN_EMAIL = 'cantosdememorias@gmail.com';
    const recipients = [order.customerEmail];
    if (order.customerEmail !== ADMIN_EMAIL) recipients.push(ADMIN_EMAIL);

    try {
      await getResend()?.emails.send({
        from: FROM_EMAIL,
        to: recipients,
        subject: `Sua música está pronta! - ${order.honoreeName}`,
        html: buildMusicReadyHtml(order, musicPageUrl, accessCode, melodiasCount, lyrics),
      });
      console.log(`[SUNO-CALLBACK] ✅ Email "música pronta" enviado para: ${recipients.join(', ')}`);
    } catch (e: any) {
      console.error('[SUNO-CALLBACK] ❌ Erro email cliente:', e?.message || e);
    }
  }

  // Email admin monitoramento
  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to: ['cantosdememorias@gmail.com'],
      subject: `MUSICA GERADA: ${order.customerName} > ${order.honoreeName} [${orderId}]`,
      html: `<h2>Musica gerada automaticamente! (via callback)</h2>
        <p><strong>Pedido:</strong> ${orderId}</p>
        <p><strong>Cliente:</strong> ${order.customerName} (${order.customerEmail})</p>
        <p><strong>Para:</strong> ${order.honoreeName}</p>
        <p><strong>Pagina:</strong> <a href="${musicPageUrl}">${musicPageUrl}</a></p>
        <p><strong>Codigo:</strong> ${accessCode}</p>`,
    });
  } catch (e) {
    console.error('[SUNO-CALLBACK] Erro email admin:', e);
  }
}

function buildMusicReadyHtml(order: any, musicPageUrl: string, accessCode: string, melodiasCount: number, lyrics: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0edf6;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:16px;">
    <div style="background:linear-gradient(135deg,#4c1d95,#7c3aed,#a855f7);border-radius:20px 20px 0 0;padding:40px 30px;text-align:center;">
      <div style="width:72px;height:72px;background:rgba(255,255,255,0.2);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:36px;line-height:72px;">&#127925;</span>
      </div>
      <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 8px;">Sua Música Está Pronta!</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0;">Música personalizada para <strong>${order.honoreeName}</strong></p>
    </div>
    <div style="background:#fff;padding:32px 28px;border-radius:0 0 20px 20px;box-shadow:0 8px 24px rgba(124,58,237,0.12);">
      <p style="color:#374151;font-size:15px;margin:0 0 20px;">Olá <strong style="color:#4c1d95;">${order.customerName}</strong>,</p>
      <div style="background:linear-gradient(135deg,#f5f3ff,#fdf2f8);border:1px solid #e9d5ff;border-radius:16px;padding:24px;text-align:center;margin:0 0 24px;">
        <div style="font-size:48px;margin-bottom:8px;">&#127881;</div>
        <h2 style="color:#4c1d95;font-size:20px;font-weight:800;margin:0 0 8px;">Ficou incrível!</h2>
        <p style="color:#6b7280;font-size:14px;margin:0;">Criamos <strong style="color:#7c3aed;">${melodiasCount} melodias</strong> exclusivas para você.</p>
      </div>
      <div style="text-align:center;margin:0 0 24px;">
        <a href="${musicPageUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:800;font-size:16px;box-shadow:0 4px 16px rgba(124,58,237,0.35);">
          &#9654;&#65039; Ouvir e Baixar Músicas
        </a>
      </div>
      ${accessCode ? `
      <div style="background:#faf5ff;border:2px dashed #c4b5fd;border-radius:14px;padding:20px;text-align:center;margin:0 0 24px;">
        <p style="color:#7c3aed;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Seu Código de Acesso</p>
        <div style="font-size:28px;font-weight:900;font-family:'Courier New',monospace;color:#4c1d95;letter-spacing:4px;margin:0 0 8px;">${accessCode}</div>
        <p style="color:#9ca3af;font-size:11px;margin:0;">Guarde este código para acessar suas músicas a qualquer momento</p>
      </div>` : ''}
      ${lyrics ? `
      <div style="border-radius:14px;overflow:hidden;margin:0 0 24px;border:1px solid #e5e7eb;">
        <div style="background:#f9fafb;padding:12px 16px;border-bottom:1px solid #e5e7eb;">
          <p style="margin:0;color:#4c1d95;font-size:13px;font-weight:700;">&#128221; Letra da sua música</p>
        </div>
        <div style="padding:16px;background:#fff;">
          <pre style="white-space:pre-wrap;font-family:Georgia,serif;font-size:13px;color:#4b5563;margin:0;line-height:1.9;">${lyrics}</pre>
        </div>
      </div>` : ''}
      <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 6px;font-weight:700;color:#92400e;font-size:13px;">&#128161; Dica importante</p>
        <p style="margin:0;color:#78350f;font-size:12px;line-height:1.6;">Clique no botão acima para ouvir e baixar o MP3. O link fica disponível por <strong>30 dias</strong>.</p>
      </div>
      <div style="text-align:center;">
        <a href="mailto:cantosdememorias@gmail.com" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:13px;">&#9993; E-mail</a>
      </div>
    </div>
    <div style="text-align:center;padding:24px 0 8px;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">&#127925; Cantos de Memórias</p>
    </div>
  </div>
</body>
</html>`;
}
