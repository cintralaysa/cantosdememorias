// Banco de dados simples usando arquivo JSON
// Em produção, considere usar um banco de dados real como PostgreSQL ou MongoDB

import { promises as fs } from 'fs';
import path from 'path';

export interface Order {
  id: string;
  createdAt: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
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

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readOrders(): Promise<Order[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export async function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const orders = await readOrders();

  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  await writeOrders(orders);

  return newOrder;
}

export async function getOrders(): Promise<Order[]> {
  return readOrders();
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await readOrders();
  return orders.find(o => o.id === id) || null;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  const orders = await readOrders();
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) return null;

  orders[index] = { ...orders[index], ...updates };
  await writeOrders(orders);

  return orders[index];
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  const orders = await readOrders();
  return orders.find(o => o.stripeSessionId === sessionId) || null;
}

export async function getOrderStats() {
  const orders = await readOrders();
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
