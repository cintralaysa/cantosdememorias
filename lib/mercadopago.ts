import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Token do Mercado Pago - Produção (hardcoded para garantir funcionamento)
const ACCESS_TOKEN = 'APP_USR-4063235147276146-122919-dd71f6ad2dc03550ecfc7e57767900a9-3101728620';

// Criar configuração do Mercado Pago
const mercadopagoConfig = new MercadoPagoConfig({
  accessToken: ACCESS_TOKEN,
  options: { timeout: 30000 }
});

// Tipos para criar preferência com dados completos do pedido
export interface CreatePreferenceData {
  orderId: string;
  title: string;
  description: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  customerWhatsapp: string;
  // Dados do pedido
  honoreeName: string;
  relationship: string;
  occasion: string;
  musicStyle: string;
  voicePreference: string;
  qualities: string;
  memories: string;
  heartMessage: string;
  familyNames?: string;
  approvedLyrics: string;
  // Chá revelação
  knowsBabySex?: string;
  babySex?: string;
  babyNameBoy?: string;
  babyNameGirl?: string;
}

export async function createMercadoPagoPreference(data: CreatePreferenceData) {
  const preferenceClient = new Preference(mercadopagoConfig);

  // URL base fixa
  const baseUrl = 'https://cantosdememorias.vercel.app';

  console.log('[MP] Criando preferência para pedido:', data.orderId);
  console.log('[MP] Valor:', data.amount);
  console.log('[MP] Email:', data.customerEmail);

  try {
    // Criar descrição completa para o item (limite de 256 caracteres)
    const itemDescription = `Para: ${data.honoreeName} | ${data.occasion} | ${data.musicStyle}`.substring(0, 250);

    const preferenceData = {
      body: {
        items: [
          {
            id: data.orderId,
            title: data.title,
            description: itemDescription,
            quantity: 1,
            unit_price: data.amount,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: data.customerEmail,
          name: data.customerName,
          phone: {
            number: data.customerWhatsapp,
          }
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
        // Metadata com todos os dados do pedido
        metadata: {
          order_id: data.orderId,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_whatsapp: data.customerWhatsapp,
          honoree_name: data.honoreeName,
          relationship: data.relationship,
          occasion: data.occasion,
          music_style: data.musicStyle,
          voice_preference: data.voicePreference,
          qualities: data.qualities.substring(0, 500),
          memories: data.memories.substring(0, 500),
          heart_message: data.heartMessage.substring(0, 500),
          family_names: data.familyNames || '',
          approved_lyrics: data.approvedLyrics.substring(0, 2000),
          knows_baby_sex: data.knowsBabySex || '',
          baby_sex: data.babySex || '',
          baby_name_boy: data.babyNameBoy || '',
          baby_name_girl: data.babyNameGirl || '',
        },
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

// Função para buscar preferência pelo ID
export async function getMercadoPagoPreference(preferenceId: string) {
  const preferenceClient = new Preference(mercadopagoConfig);
  const preference = await preferenceClient.get({ preferenceId });
  return preference;
}
