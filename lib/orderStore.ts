// Armazenamento temporário de pedidos em memória
// Para produção com múltiplas instâncias, usar Redis ou banco de dados

interface OrderData {
  orderId: string;
  amount: number;
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
  voicePreference: string;
  qualities: string;
  memories: string;
  heartMessage: string;
  familyNames?: string;
  approvedLyrics: string;
  generatedLyrics?: string;
  knowsBabySex?: string;
  babySex?: string;
  babyNameBoy?: string;
  babyNameGirl?: string;
  paymentId?: string;
  createdAt: number;
}

// Map para armazenar pedidos por paymentId
const orderStore = new Map<string, OrderData>();

// Limpar pedidos antigos (mais de 24 horas)
function cleanOldOrders() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas

  orderStore.forEach((order, key) => {
    if (now - order.createdAt > maxAge) {
      orderStore.delete(key);
    }
  });
}

// Salvar pedido
export function saveOrder(paymentId: string, orderData: Omit<OrderData, 'createdAt' | 'paymentId'>): void {
  cleanOldOrders();
  orderStore.set(paymentId, {
    ...orderData,
    paymentId,
    createdAt: Date.now(),
  });
  console.log(`[ORDER-STORE] Pedido salvo: ${paymentId}`);
}

// Buscar pedido
export function getOrder(paymentId: string): OrderData | undefined {
  const order = orderStore.get(paymentId);
  if (order) {
    console.log(`[ORDER-STORE] Pedido encontrado: ${paymentId}`);
  } else {
    console.log(`[ORDER-STORE] Pedido não encontrado: ${paymentId}`);
  }
  return order;
}

// Remover pedido
export function removeOrder(paymentId: string): void {
  orderStore.delete(paymentId);
  console.log(`[ORDER-STORE] Pedido removido: ${paymentId}`);
}

// Verificar se pedido existe
export function hasOrder(paymentId: string): boolean {
  return orderStore.has(paymentId);
}
