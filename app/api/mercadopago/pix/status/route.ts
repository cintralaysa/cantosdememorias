import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId obrigatório' }, { status: 400 });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: 'Gateway não configurado' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);

    const paymentData = await paymentClient.get({ id: Number(paymentId) });

    return NextResponse.json({
      success: true,
      status: paymentData.status,
      statusDetail: paymentData.status_detail,
      externalReference: paymentData.external_reference,
      dateApproved: paymentData.date_approved || null,
    });

  } catch (error: any) {
    console.error('Erro ao verificar status PIX MP:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}
