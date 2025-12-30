import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasMercadoPagoToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
    tokenLength: process.env.MERCADOPAGO_ACCESS_TOKEN?.length || 0,
    tokenPrefix: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 10) || 'NOT SET',
    hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  });
}
