import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import {
  sanitizeString,
  checkRateLimit,
  getClientIP,
  validateMusicFormData,
  validateVoiceoverFormData,
  isValidBrazilianPhone
} from '@/lib/security';

// Lista de preços válidos (para evitar manipulação)
const VALID_PRICES: Record<string, number> = {
  '1': 79.99, // Música Personalizada
  '2': 79.99, // Locução de Voz
};

export async function POST(req: Request) {
  try {
    // Rate limiting por IP
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`checkout:${clientIP}`, 5, 60000); // 5 requisições por minuto

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

    // Validar preço (previne manipulação do preço no frontend)
    const expectedPrice = VALID_PRICES[service.id];
    if (!expectedPrice) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 400 });
    }

    // Validar dados do formulário baseado no tipo
    const validation = service.type === 'voiceover'
      ? validateVoiceoverFormData(details)
      : validateMusicFormData(details);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Validação adicional de WhatsApp
    if (!isValidBrazilianPhone(details.whatsapp || '')) {
      return NextResponse.json({ error: 'WhatsApp inválido' }, { status: 400 });
    }

    // Sanitizar todos os dados antes de enviar ao Stripe
    const metadata: Record<string, string> = {
      serviceId: sanitizeString(service.id, 10),
      serviceType: sanitizeString(service.type, 20),
      serviceTitle: sanitizeString(service.title, 50),
      userName: sanitizeString(details.userName, 100),
      whatsapp: sanitizeString(details.whatsapp, 50),
      email: sanitizeString(details.email, 100),
    };

    // Adicionar campos específicos baseado no tipo de serviço
    if (service.type === 'voiceover') {
      Object.assign(metadata, {
        voiceoverPurpose: sanitizeString(details.voiceoverPurposeLabel || details.voiceoverPurpose, 50),
        voiceoverName: sanitizeString(details.voiceoverName, 100),
        voiceoverType: sanitizeString(details.voiceoverTypeLabel || details.voiceoverType, 50),
        voiceoverStyle: sanitizeString(details.voiceoverStyleLabel || details.voiceoverStyle, 50),
        voicePreference: sanitizeString(details.voicePreferenceLabel || details.voicePreference, 50),
        voiceoverIdea: sanitizeString(details.voiceoverIdea, 500),
        generatedScript: sanitizeString(details.generatedScript, 500),
        scriptApproved: String(details.scriptApproved === true),
      });
    } else {
      Object.assign(metadata, {
        honoreeName: sanitizeString(details.honoreeName, 100),
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
        approvedLyrics: sanitizeString(details.generatedLyrics, 500),
        lyricsApproved: String(details.lyricsApproved === true),
        knowsBabySex: sanitizeString(details.knowsBabySex, 10),
        babySex: sanitizeString(details.babySex, 20),
        babyNameBoy: sanitizeString(details.babyNameBoy, 100),
        babyNameGirl: sanitizeString(details.babyNameGirl, 100),
      });
    }

    // Criar descrição segura para o produto
    let productDescription: string;
    if (service.type === 'voiceover') {
      productDescription = [
        `Objetivo: ${sanitizeString(details.voiceoverPurposeLabel || details.voiceoverPurpose, 30) || 'N/A'}`,
        `Para: ${sanitizeString(details.voiceoverName, 30) || 'N/A'}`,
        `Tipo: ${sanitizeString(details.voiceoverTypeLabel || details.voiceoverType, 30) || 'N/A'}`,
      ].join(' | ');
    } else {
      productDescription = [
        `Para: ${sanitizeString(details.honoreeName, 30) || 'N/A'}`,
        `Ocasião: ${sanitizeString(details.occasionLabel || details.occasion, 30) || 'N/A'}`,
        `Estilo: ${sanitizeString(details.musicStyleLabel || details.musicStyle, 30) || 'N/A'}`,
      ].join(' | ');
    }

    // Nome do produto sanitizado
    const productName = service.type === 'voiceover'
      ? `${sanitizeString(service.title, 30)} - ${sanitizeString(details.voiceoverName, 30) || 'Personalizado'}`
      : `${sanitizeString(service.title, 30)} - ${sanitizeString(details.honoreeName, 30) || 'Personalizado'}`;

    const paymentDescription = service.type === 'voiceover'
      ? `Cantos de Memórias - ${sanitizeString(service.title, 30)} para ${sanitizeString(details.voiceoverName, 30)}`
      : `Cantos de Memórias - ${sanitizeString(service.title, 30)} para ${sanitizeString(details.honoreeName, 30)}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'pix'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: productName,
            description: productDescription,
          },
          // IMPORTANTE: Usar o preço do servidor, não do cliente
          unit_amount: Math.round(expectedPrice * 100),
        },
        quantity: 1,
      }],
      metadata,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/servicos/${sanitizeString(service.slug, 50)}`,
      locale: 'pt-BR',
      payment_intent_data: {
        description: paymentDescription,
        metadata,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    console.error('Stripe Error:', error);
    // Não expor detalhes do erro para o cliente
    return NextResponse.json(
      { error: 'Erro ao processar pagamento. Tente novamente.' },
      { status: 500 }
    );
  }
}
