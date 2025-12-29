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
import { sendOrderNotification } from '@/lib/email';

// Configuração do PIX
const PIX_KEY = process.env.PIX_KEY || 'cantosdememorias@gmail.com';
const PIX_NAME = process.env.PIX_NAME || 'CANTOS DE MEMORIAS';

// Lista de preços válidos
const VALID_PRICES: Record<string, number> = {
  '1': 79.99,
  '2': 79.99,
};

export async function POST(req: Request) {
  try {
    // Rate limiting por IP
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`pix:${clientIP}`, 5, 60000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas requisições. Aguarde um momento.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { service, details } = body;

    // Validação básica
    if (!service || !service.id || !service.type) {
      return NextResponse.json({ error: 'Serviço inválido' }, { status: 400 });
    }

    if (!details) {
      return NextResponse.json({ error: 'Dados não fornecidos' }, { status: 400 });
    }

    // Validar preço
    const expectedPrice = VALID_PRICES[service.id];
    if (!expectedPrice) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 400 });
    }

    // Validar dados do formulário
    const validation = service.type === 'voiceover'
      ? validateVoiceoverFormData(details)
      : validateMusicFormData(details);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Validação de WhatsApp
    if (!isValidBrazilianPhone(details.whatsapp || '')) {
      return NextResponse.json({ error: 'WhatsApp inválido' }, { status: 400 });
    }

    // Gerar ID único para o pedido PIX
    const pixOrderId = `PIX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Criar pedido no banco com status pendente
    const orderData: Omit<Order, 'id' | 'createdAt'> = {
      status: 'pending_pix',
      paymentMethod: 'pix',
      customerEmail: sanitizeString(details.email, 100),
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
      stripePaymentIntentId: pixOrderId,
    };

    const order = await createOrder(orderData);

    // Enviar notificação para admin (pedido pendente)
    await sendOrderNotification({
      ...order,
      status: 'pending_pix' as any,
    });

    // Retornar dados do PIX
    return NextResponse.json({
      success: true,
      orderId: order.id,
      pixOrderId,
      pix: {
        key: PIX_KEY,
        name: PIX_NAME,
        amount: expectedPrice,
        description: `Cantos de Memórias - Pedido #${order.id}`,
      }
    });
  } catch (error: unknown) {
    console.error('PIX Error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pedido. Tente novamente.' },
      { status: 500 }
    );
  }
}
