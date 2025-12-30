import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Token do Mercado Pago - Produção (hardcoded para garantir funcionamento)
const ACCESS_TOKEN = 'APP_USR-4063235147276146-122919-dd71f6ad2dc03550ecfc7e57767900a9-3101728620';

// Criar configuração do Mercado Pago
const mercadopagoConfig = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
  options: { timeout: 30000 }
});

// Tipos para criar preferência
export interface CreatePreferenceData {
  orderId: string;
  title: string;
  description: string;
  amount: number;
  customerEmail: string;
  customerName: string;
}

export async function createMercadoPagoPreference(data: CreatePreferenceData) {
  const preferenceClient = new Preference(mercadopagoConfig);

  // URL base fixa
  const baseUrl = 'https://cantosdememorias.vercel.app';

  console.log('[MP] Criando preferência para pedido:', data.orderId);
  console.log('[MP] Valor:', data.amount);
  console.log('[MP] Email:', data.customerEmail);

  try {
    const preferenceData = {
      body: {
        items: [
          {
            id: data.orderId,
            title: data.title,
            description: data.description,
            quantity: 1,
            unit_price: data.amount,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: data.customerEmail,
          name: data.customerName,
        },
        payment_methods: {
          installments: 12,
        },
        back_urls: {
          success: `${baseUrl}/success?order=${data.orderId}`,
          failure: `${baseUrl}/failure?order=${data.orderId}`,
          pending: `${baseUrl}/pending?order=${data.orderId}`,
        },
        auto_return: 'approved' as const,
        external_reference: data.orderId,
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        statement_descriptor: 'CANTOS MEMORIAS',
      }
    };

    console.log('[MP] Dados da preferência:', JSON.stringify(preferenceData, null, 2));

    const preference = await preferenceClient.create(preferenceData);

    console.log('[MP] Preferência criada com sucesso:', preference.id);
    console.log('[MP] Init point:', preference.init_point);

    return preference;
  } catch (error) {
    console.error('[MP] Erro ao criar preferência:', error);
    throw error;
  }
}

export async function getMercadoPagoPayment(paymentId: number) {
  const paymentClient = new Payment(mercadopagoConfig);
  const payment = await paymentClient.get({ id: paymentId });
  return payment;
}
