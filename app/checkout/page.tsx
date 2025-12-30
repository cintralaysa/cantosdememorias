'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Shield, Clock, Heart, Loader2, CheckCircle, AlertCircle, ArrowLeft, Music } from 'lucide-react';
import Link from 'next/link';

// Public Key do Mercado Pago
const MP_PUBLIC_KEY = 'APP_USR-f463b764-a87e-4da0-b0ab-4e1ed1c49436';

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
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

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

    // Inicializar o SDK do Mercado Pago
    initMercadoPago(MP_PUBLIC_KEY, {
      locale: 'pt-BR',
    });
    setIsReady(true);
  }, []);

  const onSubmit = useCallback(async ({ selectedPaymentMethod, formData }: any) => {
    if (!orderData) return;

    setProcessing(true);
    setPaymentStatus('processing');
    setError(null);

    try {
      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData: formData,
          orderData: orderData,
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.status === 'approved') {
        setPaymentStatus('success');
        sessionStorage.removeItem('checkoutData');
      } else if (result.status === 'pending' || result.status === 'in_process') {
        // PIX ou boleto pendente
        setPaymentStatus('success');
        sessionStorage.removeItem('checkoutData');
      } else {
        throw new Error(result.statusDetail || 'Pagamento não aprovado');
      }
    } catch (err: any) {
      console.error('Erro no pagamento:', err);
      setError(err.message || 'Erro ao processar pagamento. Tente novamente.');
      setPaymentStatus('error');
    } finally {
      setProcessing(false);
    }
  }, [orderData]);

  const onError = useCallback((error: any) => {
    console.error('Erro no brick:', error);
    setError('Erro ao carregar formulário de pagamento. Recarregue a página.');
  }, []);

  const onReady = useCallback(() => {
    console.log('Payment Brick pronto');
  }, []);

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

  // Tela de sucesso
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h1>
          <p className="text-gray-600 mb-6">
            Sua música para <strong>{orderData.honoreeName}</strong> está sendo criada com todo carinho.
          </p>

          <div className="bg-violet-50 rounded-xl p-4 mb-6">
            <p className="text-violet-700 text-sm">
              📱 Você receberá <strong>2 melodias diferentes</strong> no seu WhatsApp em até <strong>24 horas</strong>.
            </p>
          </div>

          <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Para:</span>
              <span className="font-semibold text-gray-900">{orderData.honoreeName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ocasião:</span>
              <span className="font-semibold text-gray-900">{orderData.occasionLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Valor:</span>
              <span className="font-semibold text-green-600">R$ {orderData.amount.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-violet-700 transition"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const initialization = {
    amount: orderData.amount,
    payer: {
      email: orderData.customerEmail,
    },
  };

  const customization = {
    paymentMethods: {
      creditCard: 'all' as const,
      debitCard: 'all' as const,
      bankTransfer: 'all' as const,
      maxInstallments: 12,
    },
    visual: {
      style: {
        theme: 'default' as const,
      },
    },
  };

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

          {/* Payment Brick */}
          <div className="p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Meios de pagamento</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 font-medium">Erro no pagamento</p>
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-700 underline text-sm mt-1"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            {isReady ? (
              <Payment
                initialization={initialization}
                customization={customization}
                onSubmit={onSubmit}
                onReady={onReady}
                onError={onError}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              </div>
            )}
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

      {/* Loading overlay */}
      {processing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-900 font-semibold">Processando pagamento...</p>
            <p className="text-gray-500 text-sm mt-1">Aguarde um momento</p>
          </div>
        </div>
      )}
    </div>
  );
}
