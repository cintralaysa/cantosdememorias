import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// POST /api/test/send-email — Teste de envio de email
export async function POST(request: NextRequest) {
  try {
    const { to } = await request.json();
    if (!to) {
      return NextResponse.json({ error: 'Campo "to" obrigatório' }, { status: 400 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Cantos de Memórias <contato@cantosdememorias.com.br>';

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: '🎵 Teste - Cantos de Memórias',
      html: `
        <div style="font-family:Arial;max-width:500px;margin:auto;padding:20px;">
          <div style="background:linear-gradient(135deg,#4c1d95,#7c3aed);color:white;padding:30px;border-radius:15px 15px 0 0;text-align:center;">
            <h1 style="margin:0;font-size:24px;">🎵 Teste de Email</h1>
          </div>
          <div style="background:white;padding:25px;border:1px solid #e5e7eb;border-radius:0 0 15px 15px;">
            <p>Olá! Este é um email de teste do <strong>Cantos de Memórias</strong>.</p>
            <p>Se você recebeu este email, a configuração está funcionando corretamente! ✅</p>
            <p style="color:#6b7280;font-size:13px;">Enviado de: ${FROM_EMAIL}</p>
            <p style="color:#6b7280;font-size:13px;">Para: ${to}</p>
            <p style="color:#6b7280;font-size:13px;">Data: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Email enviado para ${to}`,
      from: FROM_EMAIL,
      result,
    });
  } catch (error: any) {
    console.error('Erro ao enviar email de teste:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erro desconhecido',
      statusCode: error?.statusCode,
    }, { status: 500 });
  }
}
