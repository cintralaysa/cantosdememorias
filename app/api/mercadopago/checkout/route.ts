import { NextResponse } from 'next/server';
import {
  sanitizeString,
  checkRateLimit,
  getClientIP,
  validateMusicFormData,
  validateVoiceoverFormData,
  isValidBrazilianPhone
} from '@/lib/security';
import { createOrder, Order } from '@/lib/db';
import { createMercadoPagoPreference } from '@/lib/mercadopago';

// Lista de preços válidos
const VALID_PRICES: Record<string, number> = {
  '1': 79.99,
  '2': 79.99,
};

export async function POST(req: Request) {
  console.log('[CHECKOUT] Iniciando checkout Mercado Pago');

  try {
    // Rate limiting por IP
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`mp-checkout:${clientIP}`, 5, 60000);

    if (!rateLimit.allowed) {
      console.log('[CHECKOUT] Rate limit atingido para:', clientIP);
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um momento.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    console.log('[CHECKOUT] Body recebido:', JSON.stringify(body, null, 2));

    const { service, details } = body;

    // Validação básica
    if (!service || !service.id || !service.type) {
      console.log('[CHECKOUT] Serviço inválido:', service);
      return NextResponse.json({ error: 'Serviço inválido' }, { status: 400 });
    }

    if (!details) {
      console.log('[CHECKOUT] Dados não fornecidos');
      return NextResponse.json({ error: 'Dados não fornecidos' }, { status: 400 });
    }

    // Validar preço
    const expectedPrice = VALID_PRICES[service.id];
    if (!expectedPrice) {
      console.log('[CHECKOUT] Serviço não encontrado:', service.id);
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 400 });
    }

    console.log('[CHECKOUT] Preço esperado:', expectedPrice);

    // Validar dados do formulário
    const validation = service.type === 'voiceover'
      ? validateVoiceoverFormData(details)
      : validateMusicFormData(details);

    if (!validation.valid) {
      console.log('[CHECKOUT] Validação falhou:', validation.errors);
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Validação de WhatsApp
    if (!isValidBrazilianPhone(details.whatsapp || '')) {
      console.log('[CHECKOUT] WhatsApp inválido:', details.whatsapp);
      return NextResponse.json({ error: 'WhatsApp inválido' }, { status: 400 });
    }

    console.log('[CHECKOUT] Validações OK, criando pedido...');

    // Criar pedido no banco com status pendente
    const orderData: Omit<Order, 'id' | 'createdAt'> = {
      status: 'pending',
      paymentMethod: 'unknown',
      customerEmail: sanitizeString(details.email, 100) || 'cliente@email.com',
      customerName: sanitizeString(details.userName, 100),
      honoreeName: sanitizeString(details.honoreeName || details.voiceoverName, 100),
      relationship: sanitizeString(details.relationship, 50),
      relationshipLabel: sanitizeString(details.relationshipLabel || details.relationship, 50),
      occasion: sanitizeString(details.occasion, 50),
      occasionLabel: sanitizeString(details.occasionLabel || details.occasion, 50),
      musicStyle: sanitizeString(details.musicStyle, 50),
      musicStyleLabel: sanitizeString(details.musicStyleLabel || details.musicStyle, 50),
      voicePreference: sanitizeString(details.voicePreference, 50),
      qualities: sanitizeString(details.qualities, 500),
      memories: sanitizeString(details.memories, 500),
      heartMessage: sanitizeString(details.heartMessage, 500),
      familyNames: sanitizeString(details.familyNames, 300),
      knowsBabySex: sanitizeString(details.knowsBabySex, 10),
      babySex: sanitizeString(details.babySex, 20),
      babyNameBoy: sanitizeString(details.babyNameBoy, 100),
      babyNameGirl: sanitizeString(details.babyNameGirl, 100),
      approvedLyrics: sanitizeString(details.generatedLyrics, 2000),
      amount: expectedPrice,
      stripeSessionId: '',
      stripePaymentIntentId: '',
    };

    const order = await createOrder(orderData);
    console.log('[CHECKOUT] Pedido criado:', order.id);

    // Criar preferência no Mercado Pago
    console.log('[CHECKOUT] Criando preferência no Mercado Pago...');
    const preference = await createMercadoPagoPreference({
      orderId: order.id,
      title: service.type === 'voiceover' ? 'Locução Personalizada' : 'Música Personalizada',
      description: `Cantos de Memórias - Pedido #${order.id}`,
      amount: expectedPrice,
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName,
    });

    console.log('[CHECKOUT] Preferência criada, ID:', preference.id);
    console.log('[CHECKOUT] URL de checkout:', preference.init_point);

    // Retornar URL de checkout do Mercado Pago
    return NextResponse.json({
      success: true,
      orderId: order.id,
      checkoutUrl: preference.init_point,
      sandboxUrl: preference.sandbox_init_point,
    });
  } catch (error: unknown) {
    console.error('[CHECKOUT] Erro no checkout:', error);

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('[CHECKOUT] Mensagem:', error.message);
      console.error('[CHECKOUT] Stack:', error.stack);

      // Verificar se é erro do Mercado Pago
      const mpError = error as { cause?: { message?: string } };
      if (mpError.cause) {
        console.error('[CHECKOUT] Causa do erro:', mpError.cause);
      }
    }

    // Tentar retornar erro mais específico
    let errorMessage = 'Erro ao processar pedido. Tente novamente.';
    if (error instanceof Error && error.message) {
      if (error.message.includes('access_token')) {
        errorMessage = 'Erro de configuração do pagamento.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout na conexão. Tente novamente.';
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
