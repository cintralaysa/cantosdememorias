import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Token do Mercado Pago - Produção
const MERCADOPAGO_TOKEN = 'APP_USR-4063235147276146-122919-dd71f6ad2dc03550ecfc7e57767900a9-3101728620';

// Usar variável de ambiente se disponível, senão usar o token hardcoded
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || MERCADOPAGO_TOKEN;

export const mercadopago = new MercadoPagoConfig({
  accessToken,
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
  // URL fixa do Vercel
  const baseUrl = 'https://cantosdememorias.vercel.app';

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
