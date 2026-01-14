import { NextRequest, NextResponse } from 'next/server';

const OPENPIX_APP_ID = process.env.OPENPIX_APP_ID;

// Verificar status do pagamento PIX
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const correlationID = searchParams.get('correlationID');

    if (!correlationID) {
      return NextResponse.json(
        { error: 'correlationID obrigatório' },
        { status: 400 }
      );
    }

    if (!OPENPIX_APP_ID) {
      return NextResponse.json(
        { error: 'Gateway não configurado' },
        { status: 500 }
      );
    }

    // Consultar status na OpenPix
    const response = await fetch(
      `https://api.openpix.com.br/api/v1/charge/${correlationID}`,
      {
        headers: {
          'Authorization': OPENPIX_APP_ID,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro ao consultar OpenPix:', errorText);
      return NextResponse.json(
        { error: 'Erro ao consultar status' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const charge = data.charge || data;

    // Status possíveis: ACTIVE, COMPLETED, EXPIRED
    const status = charge.status;
    const isPaid = status === 'COMPLETED';
    const isExpired = status === 'EXPIRED';

    return NextResponse.json({
      success: true,
      correlationID,
      status,
      isPaid,
      isExpired,
      paidAt: charge.paidAt || null,
      value: charge.value,
    });

  } catch (error) {
    console.error('Erro ao verificar status PIX:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}
