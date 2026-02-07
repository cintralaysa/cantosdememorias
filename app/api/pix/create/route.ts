import { NextRequest, NextResponse } from 'next/server';
import { saveOrder } from '@/lib/orderStore';

const OPENPIX_APP_ID = process.env.OPENPIX_APP_ID;

// Preços em centavos
const PRECOS = {
  basico: 4990,  // R$ 49,90
  premium: 7990  // R$ 79,90
};

const PRECOS_FORMATADOS = {
  basico: 'R$ 49,90',
  premium: 'R$ 79,90'
};

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    // Determinar o plano e preço
    const plan = orderData.plan || 'basico';
    const preco = PRECOS[plan as keyof typeof PRECOS] || PRECOS.basico;
    const precoFormatado = PRECOS_FORMATADOS[plan as keyof typeof PRECOS_FORMATADOS] || PRECOS_FORMATADOS.basico;

    // Gerar ID único do pedido
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const correlationID = orderId;

    if (!OPENPIX_APP_ID) {
      console.error('OPENPIX_APP_ID não configurado');
      return NextResponse.json(
        { error: 'Gateway de pagamento não configurado' },
        { status: 500 }
      );
    }

    // Salvar dados completos do pedido no Redis ANTES de criar o PIX
    const saved = await saveOrder(correlationID, {
      orderId,
      amount: preco,
      plan: plan,
      customerName: orderData.customerName || '',
      customerEmail: orderData.customerEmail || '',
      customerWhatsapp: orderData.customerWhatsapp || '',
      honoreeName: orderData.honoreeName || '',
      relationship: orderData.relationship || '',
      relationshipLabel: orderData.relationshipLabel || '',
      occasion: orderData.occasion || '',
      occasionLabel: orderData.occasionLabel || '',
      musicStyle: orderData.musicStyle || '',
      musicStyleLabel: orderData.musicStyleLabel || '',
      musicStyle2: orderData.musicStyle2 || '',
      musicStyle2Label: orderData.musicStyle2Label || '',
      voicePreference: orderData.voicePreference || '',
      storyAndMessage: orderData.storyAndMessage || '',
      familyNames: orderData.familyNames || '',
      generatedLyrics: orderData.generatedLyrics || '',
      knowsBabySex: orderData.knowsBabySex || '',
      babySex: orderData.babySex || '',
      babyNameBoy: orderData.babyNameBoy || '',
      babyNameGirl: orderData.babyNameGirl || '',
    });

    if (!saved) {
      console.error('Erro ao salvar pedido no Redis - continuando mesmo assim');
    }

    // Criar cobrança PIX na OpenPix
    const planLabel = plan === 'premium' ? 'Premium' : 'Básico';
    const pixResponse = await fetch('https://api.openpix.com.br/api/v1/charge', {
      method: 'POST',
      headers: {
        'Authorization': OPENPIX_APP_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correlationID,
        value: preco,
        comment: `Música personalizada (${planLabel}) para ${orderData.honoreeName || 'presente'}`,
        customer: {
          name: orderData.customerName,
          email: orderData.customerEmail,
          phone: orderData.customerWhatsapp?.replace(/\D/g, ''),
        },
        additionalInfo: [
          { key: 'Plano', value: planLabel },
          { key: 'Homenageado', value: orderData.honoreeName || 'N/A' },
          { key: 'Ocasião', value: orderData.occasionLabel || orderData.occasion || 'N/A' },
          { key: 'Estilo', value: orderData.musicStyleLabel || orderData.musicStyle || 'N/A' },
        ].filter(item => item.key && item.value),
        expiresIn: 3600, // 1 hora para pagar
      }),
    });

    if (!pixResponse.ok) {
      const errorData = await pixResponse.text();
      console.error('Erro OpenPix:', errorData);
      return NextResponse.json(
        { error: 'Erro ao gerar PIX' },
        { status: 500 }
      );
    }

    const pixData = await pixResponse.json();

    console.log('=== PIX GERADO ===');
    console.log('Order ID:', orderId);
    console.log('Correlation ID:', correlationID);
    console.log('Plano:', planLabel);
    console.log('Valor:', precoFormatado);
    console.log('Dados salvos no Redis:', saved ? 'SIM' : 'NÃO');
    console.log('QR Code gerado com sucesso');
    console.log('Aguardando pagamento - emails serão enviados após confirmação');

    // NÃO enviar emails aqui - só após confirmação do pagamento via webhook

    return NextResponse.json({
      success: true,
      orderId,
      correlationID,
      plan,
      pixData: {
        qrCode: pixData.charge?.qrCodeImage || pixData.qrCodeImage,
        qrCodeBase64: pixData.charge?.qrCodeImage || pixData.qrCodeImage,
        pixCopiaECola: pixData.charge?.brCode || pixData.brCode,
        expiresAt: pixData.charge?.expiresAt || pixData.expiresAt,
        value: preco,
        valueFormatted: precoFormatado,
      },
    });
  } catch (error) {
    console.error('Erro ao criar PIX:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}
