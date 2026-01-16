// Armazenamento de pedidos usando Upstash Redis
// Para funcionar no Vercel com múltiplas instâncias

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export interface OrderData {
  orderId: string;
  correlationID: string;
  amount: number;
  plan?: 'basico' | 'premium';
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  honoreeName: string;
  relationship: string;
  relationshipLabel: string;
  occasion: string;
  occasionLabel: string;
  musicStyle: string;
  musicStyleLabel: string;
  musicStyle2?: string; // Segundo estilo para Premium
  musicStyle2Label?: string;
  voicePreference: string;
  storyAndMessage?: string;
  qualities?: string;
  memories?: string;
  heartMessage?: string;
  familyNames?: string;
  generatedLyrics?: string;
  approvedLyrics?: string;
  knowsBabySex?: string;
  babySex?: string;
  babyNameBoy?: string;
  babyNameGirl?: string;
  createdAt: number;
}

// Salvar pedido no Redis
export async function saveOrder(correlationID: string, orderData: Omit<OrderData, 'createdAt' | 'correlationID'>): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.error('[ORDER-STORE] Upstash não configurado! Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN');
    return false;
  }

  try {
    const data: OrderData = {
      ...orderData,
      correlationID,
      createdAt: Date.now(),
    };

    // Salvar com expiração de 24 horas (86400 segundos)
    const response = await fetch(`${UPSTASH_URL}/set/order:${correlationID}?EX=86400`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ORDER-STORE] Erro ao salvar:', errorText);
      return false;
    }

    console.log(`[ORDER-STORE] ✅ Pedido salvo: ${correlationID}`);
    return true;
  } catch (error) {
    console.error('[ORDER-STORE] Erro ao salvar pedido:', error);
    return false;
  }
}

// Buscar pedido do Redis
export async function getOrder(correlationID: string): Promise<OrderData | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    console.error('[ORDER-STORE] Upstash não configurado!');
    return null;
  }

  try {
    const response = await fetch(`${UPSTASH_URL}/get/order:${correlationID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('[ORDER-STORE] Erro ao buscar pedido');
      return null;
    }

    const result = await response.json();

    if (!result.result) {
      console.log(`[ORDER-STORE] Pedido não encontrado: ${correlationID}`);
      return null;
    }

    // Upstash retorna string, precisamos parsear
    const orderData = typeof result.result === 'string'
      ? JSON.parse(result.result)
      : result.result;

    console.log(`[ORDER-STORE] ✅ Pedido encontrado: ${correlationID}`);
    return orderData;
  } catch (error) {
    console.error('[ORDER-STORE] Erro ao buscar pedido:', error);
    return null;
  }
}

// Remover pedido do Redis
export async function removeOrder(correlationID: string): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return false;
  }

  try {
    const response = await fetch(`${UPSTASH_URL}/del/order:${correlationID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
      },
    });

    if (response.ok) {
      console.log(`[ORDER-STORE] Pedido removido: ${correlationID}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[ORDER-STORE] Erro ao remover pedido:', error);
    return false;
  }
}
