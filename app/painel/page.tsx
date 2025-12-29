'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: string;
  createdAt: string;
  status: string;
  paymentMethod: 'card' | 'pix' | 'unknown';
  customerEmail: string;
  customerName: string;
  honoreeName: string;
  relationshipLabel: string;
  occasionLabel: string;
  musicStyleLabel: string;
  voicePreference: string;
  qualities: string;
  memories: string;
  heartMessage: string;
  familyNames?: string;
  approvedLyrics: string;
  amount: number;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  cardRevenue: number;
  pixRevenue: number;
  cardCount: number;
  pixCount: number;
  dailyStats: { date: string; total: number; card: number; pix: number }[];
  recentOrders: Order[];
}

export default function PainelAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders'>('dashboard');

  // Verificar se já está logado
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/orders?stats=true');
      if (res.ok) {
        setIsLoggedIn(true);
        const data = await res.json();
        setStats(data);
      }
    } catch {
      // Não está logado
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsLoggedIn(true);
        loadData();
      } else {
        const data = await res.json();
        setError(data.error || 'Senha incorreta');
      }
    } catch {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsLoggedIn(false);
    setStats(null);
    setOrders([]);
    setPassword('');
  };

  const loadData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/orders?stats=true'),
        fetch('/api/admin/orders'),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  // Tela de Login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-gray-400 mt-2">Cantos de Memórias</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Digite sua senha"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Cantos de Memórias</h1>
              <p className="text-xs text-gray-500">Painel Administrativo</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={loadData}
              className="p-2 text-gray-500 hover:text-violet-600 transition-colors"
              title="Atualizar dados"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pedidos ({orders.length})
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && stats && (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm">Receita Total</span>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.totalOrders} pedidos</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm">Cartão de Crédito</span>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.cardRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.cardCount} pagamentos</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm">PIX</span>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pixRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">{stats.pixCount} pagamentos</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-sm">Ticket Médio</span>
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders) : 'R$ 0,00'}
                </p>
                <p className="text-sm text-gray-500 mt-1">por pedido</p>
              </div>
            </div>

            {/* Gráfico de Vendas */}
            <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Vendas dos Últimos 30 Dias</h3>
              <div className="h-64 flex items-end gap-1">
                {stats.dailyStats.map((day, index) => {
                  const maxValue = Math.max(...stats.dailyStats.map(d => d.total), 1);
                  const height = (day.total / maxValue) * 100;
                  const cardHeight = (day.card / maxValue) * 100;
                  const pixHeight = (day.pix / maxValue) * 100;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                      <div className="w-full flex flex-col justify-end h-48">
                        {day.total > 0 && (
                          <>
                            <div
                              className="w-full bg-blue-500 rounded-t"
                              style={{ height: `${cardHeight}%` }}
                              title={`Cartão: ${formatCurrency(day.card)}`}
                            />
                            <div
                              className="w-full bg-emerald-500"
                              style={{ height: `${pixHeight}%` }}
                              title={`PIX: ${formatCurrency(day.pix)}`}
                            />
                          </>
                        )}
                        {day.total === 0 && (
                          <div className="w-full bg-gray-200 rounded-t" style={{ height: '2px' }} />
                        )}
                      </div>
                      {index % 5 === 0 && (
                        <span className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-left">
                          {day.date.slice(5)}
                        </span>
                      )}

                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        <div>{day.date}</div>
                        <div>Total: {formatCurrency(day.total)}</div>
                        <div className="text-blue-300">Cartão: {formatCurrency(day.card)}</div>
                        <div className="text-emerald-300">PIX: {formatCurrency(day.pix)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded" />
                  <span className="text-sm text-gray-600">Cartão</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded" />
                  <span className="text-sm text-gray-600">PIX</span>
                </div>
              </div>
            </div>

            {/* Pedidos Recentes */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h3>
              </div>
              <div className="divide-y">
                {stats.recentOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Nenhum pedido ainda
                  </div>
                ) : (
                  stats.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedOrder(order);
                        setActiveTab('orders');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-sm text-gray-500">
                            Para: {order.honoreeName} - {order.occasionLabel}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(order.amount)}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentMethod === 'card'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {order.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Pedidos */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Todos os Pedidos</h3>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Nenhum pedido ainda
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedOrder?.id === order.id ? 'bg-violet-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 text-sm">{order.customerName}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          order.paymentMethod === 'card'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {order.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">Para: {order.honoreeName}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                        <span className="font-semibold text-sm text-green-600">{formatCurrency(order.amount)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Detalhes do Pedido */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
              {selectedOrder ? (
                <>
                  <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Pedido #{selectedOrder.id}</h3>
                      <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedOrder.paymentMethod === 'card'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedOrder.paymentMethod === 'card' ? 'Cartão' : 'PIX'}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {formatCurrency(selectedOrder.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                    {/* Cliente */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                        <p className="text-gray-600">{selectedOrder.customerEmail}</p>
                      </div>
                    </div>

                    {/* Detalhes do Pedido */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Detalhes</h4>
                      <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Para quem</p>
                          <p className="font-medium">{selectedOrder.honoreeName}</p>
                          <p className="text-sm text-gray-600">{selectedOrder.relationshipLabel}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Ocasião</p>
                          <p className="font-medium">{selectedOrder.occasionLabel}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Estilo Musical</p>
                          <p className="font-medium">{selectedOrder.musicStyleLabel}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Voz</p>
                          <p className="font-medium">
                            {selectedOrder.voicePreference === 'feminina' ? 'Feminina' :
                             selectedOrder.voicePreference === 'masculina' ? 'Masculina' : 'Sem preferência'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Qualidades */}
                    {selectedOrder.qualities && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Qualidades</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedOrder.qualities}</p>
                        </div>
                      </div>
                    )}

                    {/* Memórias */}
                    {selectedOrder.memories && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Memórias</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedOrder.memories}</p>
                        </div>
                      </div>
                    )}

                    {/* Mensagem do Coração */}
                    {selectedOrder.heartMessage && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Mensagem do Coração</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedOrder.heartMessage}</p>
                        </div>
                      </div>
                    )}

                    {/* Familiares */}
                    {selectedOrder.familyNames && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Familiares</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">{selectedOrder.familyNames}</p>
                        </div>
                      </div>
                    )}

                    {/* Letra Aprovada */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Letra Aprovada</h4>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <pre className="text-gray-700 whitespace-pre-wrap font-sans text-sm">{selectedOrder.approvedLyrics}</pre>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-gray-500">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Selecione um pedido para ver os detalhes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
