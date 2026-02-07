import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    email: {
      configured: true,
      adminEmail: 'cantosdememorias@gmail.com',
      message: 'Notificações por email ativas',
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL === '1',
    },
    payments: {
      pix: '/api/pix (Woovi/OpenPix)',
    },
    timestamp: new Date().toISOString(),
  });
}
