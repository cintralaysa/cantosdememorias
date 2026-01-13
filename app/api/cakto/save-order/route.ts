import { NextRequest, NextResponse } from 'next/server';

// Tentar importar KV, mas funcionar sem ele se não estiver disponível
let kv: any = null;
try {
  kv = require('@vercel/kv').kv;
} catch (e) {
  console.log('Vercel KV não disponível, continuando sem persistência');
}

// Endpoint para salvar dados do pedido antes de redirecionar para Cakto
export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Gerar ID único do pedido
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Tentar salvar no KV se disponível
    if (kv) {
      try {
        await kv.set(`cakto_order:${orderId}`, JSON.stringify({
          ...orderData,
          orderId,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }), { ex: 604800 }); // 7 dias
        console.log('Pedido salvo no KV:', orderId);
      } catch (kvError) {
        console.log('KV não disponível, continuando sem persistência:', kvError);
      }
    }

    // Construir URL do checkout Cakto com dados pré-preenchidos
    const checkoutUrl = buildCheckoutUrl(orderData, orderId);

    console.log('=== PEDIDO PARA CAKTO ===');
    console.log('Order ID:', orderId);
    console.log('Cliente:', orderData.customerName);
    console.log('Homenageado:', orderData.honoreeName);
    console.log('Checkout URL:', checkoutUrl);

    return NextResponse.json({
      success: true,
      orderId,
      checkoutUrl
    });
  } catch (error) {
    console.error('Erro ao processar pedido Cakto:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pedido' },
      { status: 500 }
    );
  }
}

function buildCheckoutUrl(orderData: any, orderId: string): string {
  const baseUrl = 'https://pay.cakto.com.br/oy9g4ou_722770';

  const params = new URLSearchParams();

  // Dados do cliente (pré-preenchidos no checkout)
  if (orderData.customerName) {
    params.append('name', orderData.customerName.trim());
  }
  if (orderData.customerEmail) {
    params.append('email', orderData.customerEmail.trim());
    params.append('confirmEmail', orderData.customerEmail.trim());
  }
  if (orderData.customerWhatsapp) {
    // Formatar telefone com código do país
    const phone = orderData.customerWhatsapp.replace(/\D/g, '');
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
    params.append('phone', formattedPhone);
  }

  // Passar orderId como parâmetro SRC para rastreamento
  // Este ID será retornado no webhook para associar os dados
  params.append('src', orderId);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

// GET para buscar pedido salvo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId obrigatório' }, { status: 400 });
    }

    if (!kv) {
      return NextResponse.json({ error: 'KV não disponível' }, { status: 503 });
    }

    const orderData = await kv.get(`cakto_order:${orderId}`);

    if (!orderData) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json(orderData);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return NextResponse.json({ error: 'Erro ao buscar pedido' }, { status: 500 });
  }
}
