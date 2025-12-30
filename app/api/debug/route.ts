import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    mercadoPago: {
      tokenConfigured: true, // Agora está hardcoded
      message: 'Token configurado diretamente no código'
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
