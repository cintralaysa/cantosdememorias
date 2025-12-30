import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Configuração do Mercado Pago
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.error('MERCADOPAGO_ACCESS_TOKEN não configurado!');
}

export const mercadopago = new MercadoPagoConfig({
  accessToken: accessToken || '',
  options: { timeout: 10000 }
});

export const preferenceClient = new Preference(mercadopago);
export const paymentClient = new Payment(mercadopago);

// Tipos para criar preferência
export interface CreatePreferenceData {
  orderId: string;
  title: string;
  description: string;
  amount: number;
  customerEmail: string;
  customerName: string;
}

export async function createPreference(data: CreatePreferenceData) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cantosdememorias.com.br';

  console.log('Criando preferência com baseUrl:', baseUrl);
  console.log('Access Token configurado:', !!accessToken);

  const preference = await preferenceClient.create({
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
        excluded_payment_types: [],
        installments: 12,
      },
      back_urls: {
        success: `${baseUrl}/success?order=${data.orderId}`,
        failure: `${baseUrl}/failure?order=${data.orderId}`,
        pending: `${baseUrl}/pending?order=${data.orderId}`,
      },
      auto_return: 'approved',
      external_reference: data.orderId,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      statement_descriptor: 'CANTOS MEMORIAS',
    }
  });

  console.log('Preferência criada:', preference.id);
  return preference;
}

export async function getPayment(paymentId: number) {
  const payment = await paymentClient.get({ id: paymentId });
  return payment;
}
