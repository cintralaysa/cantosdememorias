'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Clock, Heart, Loader2, CheckCircle, ArrowLeft, Music, CreditCard } from 'lucide-react';
import Link from 'next/link';

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
  knowsBabySex?: string;
  babySex?: string;
  babyNameBoy?: string;
  babyNameGirl?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'pix' | null>(null);

  useEffect(() => {
    // Recuperar dados do pedido do sessionStorage
    const storedData = sessionStorage.getItem('checkoutData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setOrderData(data);
      } catch (e) {
        console.error('Erro ao recuperar dados do pedido:', e);
      }
    }
  }, []);

  const handlePayment = async () => {
    if (!orderData || !selectedMethod) return;

    setLoading(true);

    try {
      // Criar preferência no Mercado Pago
      const response = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: { price: orderData.amount, title: 'Música Personalizada' },
          details: {
            ...orderData,
            userName: orderData.customerName,
            whatsapp: orderData.customerWhatsapp,
            email: orderData.customerEmail,
            generatedLyrics: orderData.approvedLyrics,
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Limpar sessionStorage antes de redirecionar
      sessionStorage.removeItem('checkoutData');

      // Redirecionar para checkout do Mercado Pago
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('URL de checkout não disponível');
      }
    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao processar. Tente novamente.');
      setLoading(false);
    }
  };

  // Se não tiver dados do pedido
  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-violet-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Nenhum pedido encontrado</h1>
          <p className="text-gray-600 mb-6">Volte para o início e configure sua música.</p>
          <Link
            href="/servicos/musica-personalizada"
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-violet-700 transition"
          >
            <ArrowLeft size={18} />
            Criar Música
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <Link
            href="/servicos/musica-personalizada"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
          <h1 className="text-xl font-bold mb-1">Estamos quase lá</h1>
          <p className="text-white/80 text-sm">
            Após pagamento enviaremos um link no seu e-mail com todas informações da sua música personalizada.
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Resumo do pedido */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="p-5 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Música para</p>
                <p className="font-semibold text-gray-900">{orderData.honoreeName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {orderData.amount.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </div>

          {/* Métodos de pagamento */}
          <div className="p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Meios de pagamento</h2>

            <div className="space-y-3">
              {/* Cartão de Crédito */}
              <button
                onClick={() => setSelectedMethod('card')}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  selectedMethod === 'card'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-violet-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedMethod === 'card' ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <CreditCard size={24} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-semibold ${selectedMethod === 'card' ? 'text-violet-700' : 'text-gray-900'}`}>
                    Cartão de crédito
                  </p>
                  <p className="text-sm text-green-600 font-medium">Parcelamento disponível</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'card' ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                }`}>
                  {selectedMethod === 'card' && <CheckCircle size={14} className="text-white" />}
                </div>
              </button>

              {/* PIX */}
              <button
                onClick={() => setSelectedMethod('pix')}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  selectedMethod === 'pix'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedMethod === 'pix' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  <svg viewBox="0 0 512 512" className="w-6 h-6 fill-current">
                    <path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-semibold ${selectedMethod === 'pix' ? 'text-green-700' : 'text-gray-900'}`}>
                    Pix
                  </p>
                  <p className="text-sm text-gray-500">Aprovação instantânea</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'pix' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {selectedMethod === 'pix' && <CheckCircle size={14} className="text-white" />}
                </div>
              </button>
            </div>

            {/* Botão Pagar */}
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || loading}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                selectedMethod && !loading
                  ? selectedMethod === 'pix'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Pagar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-green-500" />
            <span>Pagamento Seguro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-violet-500" />
            <span>Entrega em 24h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart size={14} className="text-red-400" />
            <span>+2.000 clientes</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Fornecido pelo <span className="font-semibold text-blue-500">mercado pago</span>
        </p>
      </div>
    </div>
  );
}
