import { NextResponse } from 'next/server';

// Token do Mercado Pago
const ACCESS_TOKEN = 'APP_USR-4063235147276146-122919-dd71f6ad2dc03550ecfc7e57767900a9-3101728620';

// Senha simples para acessar
const ADMIN_PASSWORD = 'cantos2024';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get('senha');

  // Verificar senha
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta. Use ?senha=cantos2024' }, { status: 401 });
  }

  try {
    // Buscar pagamentos aprovados do Mercado Pago
    const response = await fetch(
      'https://api.mercadopago.com/v1/payments/search?status=approved&sort=date_created&criteria=desc&limit=20',
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao buscar pagamentos' }, { status: 500 });
    }

    const data = await response.json();

    // Formatar dados para exibição
    const pagamentos = data.results.map((p: {
      id: number;
      date_approved: string;
      transaction_amount: number;
      payment_method_id: string;
      status: string;
      external_reference: string;
      payer: { email: string; first_name?: string };
      additional_info?: { payer?: { first_name?: string }; items?: Array<{ title: string }> };
    }) => ({
      id: p.id,
      data: new Date(p.date_approved).toLocaleString('pt-BR'),
      valor: `R$ ${p.transaction_amount?.toFixed(2).replace('.', ',')}`,
      metodo: p.payment_method_id === 'pix' ? 'PIX' : 'Cartão',
      status: p.status,
      pedido: p.external_reference,
      cliente: {
        email: p.payer?.email,
        nome: p.payer?.first_name || p.additional_info?.payer?.first_name || 'Não informado',
      },
      produto: p.additional_info?.items?.[0]?.title || 'Música Personalizada',
    }));

    return NextResponse.json({
      total: pagamentos.length,
      totalRecebido: `R$ ${pagamentos.reduce((sum: number, p: { valor: string }) => sum + parseFloat(p.valor.replace('R$ ', '').replace(',', '.')), 0).toFixed(2).replace('.', ',')}`,
      pagamentos,
      atualizadoEm: new Date().toLocaleString('pt-BR'),
    });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
