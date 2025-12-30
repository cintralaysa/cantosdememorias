// Banco de dados em memória para ambiente serverless (Vercel)
// IMPORTANTE: Para produção real, use Vercel KV, Supabase, ou outro banco de dados

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

// Armazenamento em memória (funciona no Vercel, mas dados são perdidos entre cold starts)
// Em produção, substitua por Vercel KV ou Supabase
const ordersMap = new Map<string, Order>();

export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  ordersMap.set(newOrder.id, newOrder);
  console.log('[DB] Pedido criado:', newOrder.id);

  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  return Array.from(ordersMap.values());
}

export async function getOrderById(id: string): Promise<Order | null> {
  return ordersMap.get(id) || null;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const order = ordersMap.get(id);
  if (!order) return null;

  const updatedOrder = { ...order, ...updates };
  ordersMap.set(id, updatedOrder);
  console.log('[DB] Pedido atualizado:', id);

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
