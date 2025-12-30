// Banco de dados usando Vercel KV (Redis)
// Para configurar: https://vercel.com/docs/storage/vercel-kv

import { kv } from '@vercel/kv';

export interface Order {
  id: string;
  createdAt: string;
  status: 'pending' | 'pending_pix' | 'paid' | 'completed' | 'cancelled';
  paymentMethod: 'card' | 'pix' | 'unknown';

  // Dados do cliente
  customerEmail: string;
  customerName: string;

  // Dados do pedido
  honoreeName: string;
  relationship: string;
  relationshipLabel: string;
  occasion: string;
  occasionLabel: string;
  musicStyle: string;
  musicStyleLabel: string;
  voicePreference: string;
  qualities: string;
  memories: string;
  heartMessage: string;
  familyNames?: string;

  // Chá revelação
  knowsBabySex?: string;
  babySex?: string;
  babyNameBoy?: string;
  babyNameGirl?: string;

  // Letra aprovada
  approvedLyrics: string;

  // Pagamento
  amount: number;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
}

// Prefixo para as chaves no Redis
const ORDER_PREFIX = 'order:';
const ORDERS_LIST_KEY = 'orders:list';

// Verificar se KV está configurado
function isKVConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// Fallback para memória quando KV não está configurado
const memoryStore = new Map<string, Order>();
const memoryOrderIds: string[] = [];

export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  console.log('[DB] Criando pedido:', newOrder.id);

  if (isKVConfigured()) {
    try {
      // Salvar pedido no KV
      await kv.set(`${ORDER_PREFIX}${newOrder.id}`, newOrder);
      // Adicionar ID à lista de pedidos
      await kv.lpush(ORDERS_LIST_KEY, newOrder.id);
      console.log('[DB] Pedido salvo no Vercel KV:', newOrder.id);
    } catch (error) {
      console.error('[DB] Erro ao salvar no KV, usando memória:', error);
      memoryStore.set(newOrder.id, newOrder);
      memoryOrderIds.push(newOrder.id);
    }
  } else {
    console.log('[DB] KV não configurado, usando memória');
    memoryStore.set(newOrder.id, newOrder);
    memoryOrderIds.push(newOrder.id);
  }

  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  if (isKVConfigured()) {
    try {
      const orderIds = await kv.lrange(ORDERS_LIST_KEY, 0, -1) as string[];
      const orders: Order[] = [];

      for (const id of orderIds) {
        const order = await kv.get<Order>(`${ORDER_PREFIX}${id}`);
        if (order) {
          orders.push(order);
        }
      }

      return orders;
    } catch (error) {
      console.error('[DB] Erro ao buscar do KV:', error);
      return Array.from(memoryStore.values());
    }
  }

  return Array.from(memoryStore.values());
}

export async function getOrderById(id: string): Promise<Order | null> {
  console.log('[DB] Buscando pedido:', id);

  if (isKVConfigured()) {
    try {
      const order = await kv.get<Order>(`${ORDER_PREFIX}${id}`);
      console.log('[DB] Pedido encontrado no KV:', order ? 'sim' : 'não');
      return order;
    } catch (error) {
      console.error('[DB] Erro ao buscar do KV:', error);
      return memoryStore.get(id) || null;
    }
  }

  return memoryStore.get(id) || null;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  console.log('[DB] Atualizando pedido:', id);

  const order = await getOrderById(id);
  if (!order) {
    console.log('[DB] Pedido não encontrado para atualizar');
    return null;
  }

  const updatedOrder = { ...order, ...updates };

  if (isKVConfigured()) {
    try {
      await kv.set(`${ORDER_PREFIX}${id}`, updatedOrder);
      console.log('[DB] Pedido atualizado no KV:', id);
    } catch (error) {
      console.error('[DB] Erro ao atualizar no KV:', error);
      memoryStore.set(id, updatedOrder);
    }
  } else {
    memoryStore.set(id, updatedOrder);
  }

  return updatedOrder;
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  const orders = await getOrders();
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].stripeSessionId === sessionId) {
      return orders[i];
    }
  }
  return null;
}

export async function getOrderStats() {
  const orders = await getOrders();
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const cardPayments = paidOrders.filter(o => o.paymentMethod === 'card');
  const pixPayments = paidOrders.filter(o => o.paymentMethod === 'pix');

  // Vendas por dia (últimos 30 dias)
  const last30Days: { [key: string]: { total: number; card: number; pix: number } } = {};
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    last30Days[key] = { total: 0, card: 0, pix: 0 };
  }

  paidOrders.forEach(order => {
    const date = order.createdAt.split('T')[0];
    if (last30Days[date]) {
      last30Days[date].total += order.amount;
      if (order.paymentMethod === 'card') {
        last30Days[date].card += order.amount;
      } else if (order.paymentMethod === 'pix') {
        last30Days[date].pix += order.amount;
      }
    }
  });

  return {
    totalOrders: paidOrders.length,
    totalRevenue,
    cardRevenue: cardPayments.reduce((sum, o) => sum + o.amount, 0),
    pixRevenue: pixPayments.reduce((sum, o) => sum + o.amount, 0),
    cardCount: cardPayments.length,
    pixCount: pixPayments.length,
    dailyStats: Object.entries(last30Days).map(([date, stats]) => ({
      date,
      ...stats
    })),
    recentOrders: paidOrders.slice(-10).reverse(),
  };
}
