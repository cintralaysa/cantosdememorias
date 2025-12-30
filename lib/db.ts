// Banco de dados usando Vercel KV (Redis) com fallback para memória global
// O fallback funciona porque usa uma variável global que persiste entre chamadas na mesma instância

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

// Usar variável global para persistir entre chamadas na mesma instância
// Em serverless, isso persiste enquanto a instância estiver ativa
declare global {
  // eslint-disable-next-line no-var
  var ordersStore: Map<string, Order> | undefined;
}

// Inicializar store global
if (!global.ordersStore) {
  global.ordersStore = new Map<string, Order>();
}

const ordersMap = global.ordersStore;

export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  ordersMap.set(newOrder.id, newOrder);
  console.log('[DB] Pedido criado:', newOrder.id);
  console.log('[DB] Total de pedidos em memória:', ordersMap.size);

  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  return Array.from(ordersMap.values());
}

export async function getOrderById(id: string): Promise<Order | null> {
  console.log('[DB] Buscando pedido:', id);
  console.log('[DB] Pedidos disponíveis:', Array.from(ordersMap.keys()));
  const order = ordersMap.get(id) || null;
  console.log('[DB] Pedido encontrado:', order ? 'sim' : 'não');
  return order;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  console.log('[DB] Atualizando pedido:', id);

  const order = ordersMap.get(id);
  if (!order) {
    console.log('[DB] Pedido não encontrado para atualizar');
    return null;
  }

  const updatedOrder = { ...order, ...updates };
  ordersMap.set(id, updatedOrder);
  console.log('[DB] Pedido atualizado:', id, 'Novo status:', updates.status);

  return updatedOrder;
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  const orders = Array.from(ordersMap.values());
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].stripeSessionId === sessionId) {
      return orders[i];
    }
  }
  return null;
}

export async function getOrderStats() {
  const orders = Array.from(ordersMap.values());
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
