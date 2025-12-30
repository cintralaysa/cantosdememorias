import { NextResponse } from 'next/server';

export async function GET() {
  const kvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

  return NextResponse.json({
    status: 'ok',
    mercadoPago: {
      tokenConfigured: true,
      message: 'Token configurado diretamente no código'
    },
    database: {
      type: kvConfigured ? 'Vercel KV (Redis)' : 'Memória (temporário)',
      kvConfigured,
      warning: !kvConfigured ? 'Configure Vercel KV para persistência dos dados!' : null,
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
