import { NextResponse } from 'next/server';

export async function GET() {
  const hasResendKey = !!process.env.RESEND_API_KEY;

  return NextResponse.json({
    status: 'ok',
    mercadoPago: {
      tokenConfigured: true,
      message: 'Token configurado diretamente no código'
    },
    email: {
      configured: hasResendKey,
      adminEmail: process.env.ADMIN_EMAIL || 'laysaarthur3209@gmail.com',
      message: hasResendKey ? 'Notificações por email ativas' : 'Configure RESEND_API_KEY para receber emails',
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL === '1',
    },
    endpoints: {
      checkout: '/api/mercadopago/checkout',
      webhook: '/api/mercadopago/webhook',
    },
    timestamp: new Date().toISOString(),
  });
}
