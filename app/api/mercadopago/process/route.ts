import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { saveOrder, updateOrder } from '@/lib/orderStore';
import { scheduleGeneration } from '@/lib/qstash';
import { Resend } from 'resend';

const PRECOS_CENTAVOS: Record<string, number> = {
  basico: 3990,
  premium: 7990,
};

const PRECOS_REAIS: Record<string, number> = {
  basico: 39.90,
  premium: 79.90,
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardFormData, orderData } = body;

    if (!cardFormData?.token) {
      return NextResponse.json({ error: 'Token do cartão não fornecido' }, { status: 400 });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return NextResponse.json({ error: 'Gateway de pagamento não configurado' }, { status: 500 });
    }

    const plan = orderData?.plan || 'basico';
    const precoReais = PRECOS_REAIS[plan] || PRECOS_REAIS.basico;
    const precoCentavos = PRECOS_CENTAVOS[plan] || PRECOS_CENTAVOS.basico;

    // Gerar ID único do pedido
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // 1) Salvar pedido no Redis ANTES de processar pagamento
    const saved = await saveOrder(orderId, {
      orderId,
      amount: precoCentavos,
      plan,
      paymentMethod: 'card',
      status: 'pending',
      customerName: orderData?.customerName || '',
      customerEmail: orderData?.customerEmail || '',
      customerWhatsapp: orderData?.customerWhatsapp || '',
      honoreeName: orderData?.honoreeName || '',
      relationship: orderData?.relationship || '',
      relationshipLabel: orderData?.relationshipLabel || '',
      occasion: orderData?.occasion || '',
      occasionLabel: orderData?.occasionLabel || '',
      musicStyle: orderData?.musicStyle || '',
      musicStyleLabel: orderData?.musicStyleLabel || '',
      musicStyle2: orderData?.musicStyle2 || '',
      musicStyle2Label: orderData?.musicStyle2Label || '',
      voicePreference: orderData?.voicePreference || '',
      storyAndMessage: orderData?.storyAndMessage || '',
      familyNames: orderData?.familyNames || '',
      generatedLyrics: orderData?.generatedLyrics || '',
      knowsBabySex: orderData?.knowsBabySex || '',
      babySex: orderData?.babySex || '',
      babyNameBoy: orderData?.babyNameBoy || '',
      babyNameGirl: orderData?.babyNameGirl || '',
    });

    if (!saved) {
      console.error('Erro ao salvar pedido no Redis');
    }

    // 2) Criar Payment com token do cartão
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: precoReais,
        token: cardFormData.token,
        description: `Música personalizada para ${orderData?.honoreeName || 'Presente'}`,
        installments: cardFormData.installments || 1,
        payment_method_id: cardFormData.payment_method_id,
        issuer_id: cardFormData.issuer_id,
        payer: {
          email: cardFormData.payer?.email || orderData?.customerEmail || '',
          identification: cardFormData.payer?.identification,
        },
        external_reference: orderId,
        statement_descriptor: 'CANTOSMEMORIAS',
      },
      requestOptions: {
        idempotencyKey: orderId,
      },
    });

    console.log('=== MP CARD PAYMENT ===');
    console.log('Order:', orderId);
    console.log('Status:', result.status);
    console.log('Detail:', result.status_detail);
    console.log('Payment ID:', result.id);

    if (result.status === 'approved') {
      // 3) Pagamento aprovado — atualizar Redis
      await updateOrder(orderId, {
        status: 'paid',
        emailSentAt: new Date().toISOString(),
      });

      // 4) Enviar emails
      const planLabel = plan === 'premium' ? 'Premium (3 Músicas)' : 'Básico (1 Música)';
      const installments = cardFormData.installments || 1;

      try {
        // Email para admin
        await resend.emails.send({
          from: 'Cantos de Memórias <pedidos@cantosdememorias.com.br>',
          to: ['cantosdememorias@gmail.com'],
          subject: `🎵 Novo Pedido CARTÃO #${orderId.slice(-6)} - ${orderData?.honoreeName || 'Cliente'}`,
          html: buildAdminEmail(orderId, planLabel, precoReais, installments, orderData),
        });

        // Email para cliente
        if (orderData?.customerEmail) {
          await resend.emails.send({
            from: 'Cantos de Memórias <pedidos@cantosdememorias.com.br>',
            to: [orderData.customerEmail],
            subject: '✅ Pagamento Confirmado - Sua música está sendo criada!',
            html: buildCustomerEmail(orderId, planLabel, precoReais, installments, orderData),
          });
        }
      } catch (emailError) {
        console.error('Erro ao enviar emails:', emailError);
      }

      // 5) Agendar geração da música
      try {
        await scheduleGeneration(orderId);
        console.log('Geração agendada para:', orderId);
      } catch (genError) {
        console.error('Erro ao agendar geração:', genError);
      }

      return NextResponse.json({
        status: 'approved',
        orderId,
        paymentId: result.id,
      });

    } else if (result.status === 'in_process' || result.status === 'pending') {
      return NextResponse.json({
        status: 'pending',
        orderId,
        statusDetail: result.status_detail,
      });

    } else {
      // Pagamento recusado
      return NextResponse.json({
        status: 'rejected',
        statusDetail: result.status_detail,
        message: getRejectMessage(result.status_detail || ''),
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Erro ao processar pagamento com cartão:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}

// Mensagens amigáveis para rejeições
function getRejectMessage(statusDetail: string): string {
  const messages: Record<string, string> = {
    'cc_rejected_bad_filled_card_number': 'Número do cartão inválido. Verifique e tente novamente.',
    'cc_rejected_bad_filled_date': 'Data de validade inválida.',
    'cc_rejected_bad_filled_other': 'Dados do cartão incorretos. Verifique e tente novamente.',
    'cc_rejected_bad_filled_security_code': 'Código de segurança inválido.',
    'cc_rejected_blacklist': 'Não foi possível processar este cartão.',
    'cc_rejected_call_for_authorize': 'Autorize o pagamento junto ao seu banco e tente novamente.',
    'cc_rejected_card_disabled': 'Cartão desabilitado. Ative junto ao seu banco.',
    'cc_rejected_card_error': 'Erro no cartão. Tente com outro cartão.',
    'cc_rejected_duplicated_payment': 'Pagamento duplicado. Verifique seu extrato.',
    'cc_rejected_high_risk': 'Pagamento recusado por segurança. Tente outro cartão.',
    'cc_rejected_insufficient_amount': 'Saldo insuficiente.',
    'cc_rejected_invalid_installments': 'Parcelas inválidas para este cartão.',
    'cc_rejected_max_attempts': 'Limite de tentativas atingido. Tente outro cartão.',
    'cc_rejected_other_reason': 'Pagamento recusado. Tente outro cartão.',
  };
  return messages[statusDetail] || 'Pagamento recusado. Tente novamente ou use outro cartão.';
}

// Email para admin
function buildAdminEmail(orderId: string, planLabel: string, valor: number, parcelas: number, order: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 20px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">💳 Novo Pedido via Cartão</h1>
      </div>
      <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6b7280;">Pedido:</td><td style="padding: 8px 0; font-weight: bold;">${orderId}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Plano:</td><td style="padding: 8px 0; font-weight: bold;">${planLabel}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Valor:</td><td style="padding: 8px 0; font-weight: bold;">R$ ${valor.toFixed(2)} (${parcelas}x no cartão)</td></tr>
          <tr><td colspan="2" style="border-top: 1px solid #e5e7eb; padding-top: 12px;"></td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Cliente:</td><td style="padding: 8px 0; font-weight: bold;">${order?.customerName || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0;">${order?.customerEmail || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">WhatsApp:</td><td style="padding: 8px 0;">${order?.customerWhatsapp || 'N/A'}</td></tr>
          <tr><td colspan="2" style="border-top: 1px solid #e5e7eb; padding-top: 12px;"></td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Homenageado:</td><td style="padding: 8px 0; font-weight: bold;">${order?.honoreeName || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Ocasião:</td><td style="padding: 8px 0;">${order?.occasionLabel || order?.occasion || 'N/A'}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Estilo:</td><td style="padding: 8px 0;">${order?.musicStyleLabel || order?.musicStyle || 'N/A'}</td></tr>
        </table>
        ${order?.generatedLyrics ? `<div style="margin-top: 16px; padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;"><p style="font-weight: bold; margin: 0 0 8px;">Letra aprovada:</p><pre style="white-space: pre-wrap; font-size: 13px; color: #374151; margin: 0;">${order.generatedLyrics}</pre></div>` : ''}
        <p style="color: #22c55e; font-weight: bold; margin-top: 16px;">✅ Entrega Automática — Geração agendada via QStash</p>
      </div>
    </div>`;
}

// Email para cliente
function buildCustomerEmail(orderId: string, planLabel: string, valor: number, parcelas: number, order: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎵 Pagamento Confirmado!</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px;">Olá <strong>${order?.customerName || 'Cliente'}</strong>,</p>
        <p>Seu pagamento foi aprovado com sucesso! Estamos criando a música personalizada para <strong>${order?.honoreeName || ''}</strong>.</p>
        <div style="background: white; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 4px 0;">📋 <strong>Pedido:</strong> ${orderId}</p>
          <p style="margin: 4px 0;">🎶 <strong>Plano:</strong> ${planLabel}</p>
          <p style="margin: 4px 0;">💰 <strong>Valor:</strong> R$ ${valor.toFixed(2)} ${parcelas > 1 ? `(${parcelas}x no cartão)` : ''}</p>
          <p style="margin: 4px 0;">🎵 <strong>Estilo:</strong> ${order?.musicStyleLabel || order?.musicStyle || 'N/A'}</p>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; color: #166534;"><strong>🎵 Sua música ficará pronta em poucos minutos!</strong></p>
          <p style="margin: 8px 0 0; color: #166534; font-size: 14px;">Você receberá outro e-mail com o link para ouvir assim que estiver pronta.</p>
        </div>
        <p style="font-size: 14px;">Você também pode acessar pelo site:</p>
        <a href="https://www.cantosdememorias.com.br/acesso" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Acessar Minha Música</a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Cantos de Memórias - Transformando histórias em melodias</p>
      </div>
    </div>`;
}
