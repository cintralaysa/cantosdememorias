// Armazenamento de pedidos usando Upstash Redis
// Para funcionar no Vercel com múltiplas instâncias

const UPSTASH_URL = (process.env.UPSTASH_REDIS_REST_URL || '').trim();
const UPSTASH_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();

export interface OrderData {
  orderId: string;
  correlationID: string;
  amount: number;
  plan?: 'basico' | 'premium';
  paymentMethod?: 'pix' | 'card';
  status?: string;
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
  story?: string;
  keywords?: string;
  restrictions?: string;
  style?: string;
  styleLabel?: string;
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
  createdAt: number | string;
  updatedAt?: number;
  // Campos de geração de música (Suno AI)
  musicStatus?: 'pending' | 'generating' | 'completed' | 'failed';
  musicStartedAt?: string;
  musicCompletedAt?: string;
  sunoTasks?: string; // JSON stringified SunoTask[]
  musicUrls?: string; // JSON stringified string[] (URLs finais)
  musicRetryCount?: string;
  musicError?: string;
  accessCode?: string; // Código de acesso (CANTOS-XXXX)
  // Sistema de créditos (Premium = 3, Básico = 1)
  creditsTotal?: number;
  creditsUsed?: number;
  songs?: string; // JSON stringified SongRecord[]
  // Notificações
  emailSentAt?: string; // ISO timestamp de quando o email "música pronta" foi enviado
  // Upsell
  upsellPurchased?: boolean; // true se já comprou upsell neste pedido
}

// Registro individual de cada música criada
export interface SongRecord {
  id: number; // 1, 2, 3...
  lyrics: string;
  musicStyle: string;
  musicStyleLabel: string;
  honoreeName: string;
  occasion: string;
  status: 'generating' | 'completed' | 'failed';
  audioUrl?: string;
  sunoTaskId?: string;
  retryCount?: number;
  createdAt: string;
  completedAt?: string;
  error?: string;
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
      cache: 'no-store', // CRITICO: desabilitar cache do Next.js para sempre ler dados frescos
    });

    if (!response.ok) {
      console.error('[ORDER-STORE] Erro ao buscar pedido');
      return null;
    }

    const result = await response.json();

    if (!result.result) {
      return null;
    }

    // Upstash retorna string, precisamos parsear
    const orderData = typeof result.result === 'string'
      ? JSON.parse(result.result)
      : result.result;

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

// Atualizar campos parciais do pedido
export async function updateOrder(correlationID: string, fields: Partial<OrderData>): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return false;
  }

  try {
    const orderData = await getOrder(correlationID);
    if (!orderData) {
      console.error(`[ORDER-STORE] Pedido não encontrado para atualizar: ${correlationID}`);
      return false;
    }

    const updatedData = {
      ...orderData,
      ...fields,
      updatedAt: Date.now(),
    };

    // TTL de 72h para pedidos com música (259200 segundos)
    const ttl = updatedData.musicStatus ? 259200 : 86400;

    const response = await fetch(`${UPSTASH_URL}/set/order:${correlationID}?EX=${ttl}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      console.log(`[ORDER-STORE] ✅ Pedido atualizado: ${correlationID}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[ORDER-STORE] Erro ao atualizar pedido:', error);
    return false;
  }
}

// Salvar índice código de acesso → orderId (para busca reversa)
export async function saveAccessCodeIndex(accessCode: string, orderId: string): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return false;

  try {
    // TTL de 30 dias (2592000 segundos)
    const response = await fetch(`${UPSTASH_URL}/set/access:${accessCode}?EX=2592000`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderId),
    });

    if (response.ok) {
      console.log(`[ORDER-STORE] ✅ Índice de acesso salvo: ${accessCode} → ${orderId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[ORDER-STORE] Erro ao salvar índice de acesso:', error);
    return false;
  }
}

// Buscar orderId pelo código de acesso
export async function getOrderByAccessCode(accessCode: string): Promise<OrderData | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;

  try {
    const response = await fetch(`${UPSTASH_URL}/get/access:${accessCode}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const result = await response.json();
    if (!result.result) return null;

    const orderId = typeof result.result === 'string'
      ? result.result.replace(/^"|"$/g, '')
      : result.result;

    return await getOrder(orderId);
  } catch (error) {
    console.error('[ORDER-STORE] Erro ao buscar por código de acesso:', error);
    return null;
  }
}

// Salvar índice taskId → orderId (para callback do Suno)
export async function saveTaskIndex(taskId: string, orderId: string): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return false;

  try {
    // TTL de 1 hora (3600 segundos) - só precisa durante a geração
    const response = await fetch(`${UPSTASH_URL}/set/task:${taskId}?EX=3600`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderId),
    });

    if (response.ok) {
      console.log(`[ORDER-STORE] ✅ Índice task salvo: ${taskId} → ${orderId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[ORDER-STORE] Erro ao salvar índice de task:', error);
    return false;
  }
}

// Buscar orderId pelo taskId do Suno
export async function getOrderIdByTaskId(taskId: string): Promise<string | null> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;

  try {
    const response = await fetch(`${UPSTASH_URL}/get/task:${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) return null;

    const result = await response.json();
    if (!result.result) return null;

    return typeof result.result === 'string'
      ? result.result.replace(/^"|"$/g, '')
      : result.result;
  } catch (error) {
    console.error('[ORDER-STORE] Erro ao buscar orderId por taskId:', error);
    return null;
  }
}

// Atualizar status do pedido (mantido para compatibilidade)
export async function updateOrderStatus(correlationID: string, status: string): Promise<boolean> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return false;
  }

  try {
    // Buscar pedido atual
    const orderData = await getOrder(correlationID);
    if (!orderData) {
      console.error(`[ORDER-STORE] Pedido não encontrado para atualizar: ${correlationID}`);
      return false;
    }

    // Atualizar com novo status
    const updatedData = {
      ...orderData,
      status,
      updatedAt: Date.now(),
    };

    // Salvar novamente com expiração de 24 horas
    const response = await fetch(`${UPSTASH_URL}/set/order:${correlationID}?EX=86400`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      console.log(`[ORDER-STORE] ✅ Status atualizado: ${correlationID} -> ${status}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[ORDER-STORE] Erro ao atualizar status:', error);
    return false;
  }
}
