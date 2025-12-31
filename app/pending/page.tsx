'use client';

import { useEffect, useState } from 'react';
import { Clock, ArrowRight, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order');
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'error'>('pending');
  const [checkCount, setCheckCount] = useState(0);

  // Função para verificar status do pagamento
  const checkPaymentStatus = async () => {
    setChecking(true);
    try {
      const params = new URLSearchParams();
      if (paymentId) params.set('payment_id', paymentId);
      if (orderId) params.set('order', orderId);
      if (externalReference) params.set('external_reference', externalReference);

      const response = await fetch(`/api/mercadopago/check-payment?${params.toString()}`);
      const data = await response.json();

      console.log('[PENDING] Status check:', data);

      if (data.approved) {
        setStatus('approved');
        // Redirecionar para página de sucesso após 2 segundos
        setTimeout(() => {
          router.push(`/success?order=${data.orderId || orderId}`);
        }, 2000);
      } else {
        setCheckCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('[PENDING] Erro ao verificar:', error);
    } finally {
      setChecking(false);
    }
  };

  // Verificar automaticamente a cada 5 segundos (máximo 24 vezes = 2 minutos)
  useEffect(() => {
    // Verificar imediatamente ao carregar
    checkPaymentStatus();

    // Verificar periodicamente
    const interval = setInterval(() => {
      if (status === 'pending' && checkCount < 24) {
        checkPaymentStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentId, orderId, status, checkCount]);

  // Se pagamento foi aprovado
  if (status === 'approved') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>

          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Pagamento Aprovado! 🎉
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Redirecionando para a página de confirmação...
          </p>

          <div className="flex items-center justify-center gap-2 text-green-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Aguarde...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Ícone animado */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-yellow-500/30">
            <Clock className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
          {checking && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <div className="bg-white rounded-full px-3 py-1 shadow-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                <span className="text-xs font-medium text-yellow-700">Verificando...</span>
              </div>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
          Pagamento Pendente
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Seu pagamento está sendo processado. Assim que for confirmado, você será redirecionado automaticamente.
        </p>

        {orderId && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-2xl p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Pedido:</span> <span className="font-bold">#{orderId}</span>
            </p>
          </div>
        )}

        {/* Status da verificação */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full ${checking ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600">
              {checking ? 'Verificando pagamento...' : 'Aguardando confirmação'}
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Verificação automática a cada 5 segundos ({checkCount}/24)
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-left mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">O que acontece agora?</p>
            <p className="text-sm text-gray-700">
              Pagamentos via PIX são confirmados em segundos. Cartão de crédito pode levar alguns instantes.
            </p>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 text-left">
            <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-2">Importante</p>
            <p className="text-sm text-yellow-800">
              Quando o pagamento for aprovado, você receberá um email de confirmação e será redirecionado automaticamente.
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="space-y-3">
          <button
            onClick={checkPaymentStatus}
            disabled={checking}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
              checking
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg shadow-yellow-500/30'
            }`}
          >
            {checking ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Verificar Agora
              </>
            )}
          </button>

          <Link
            href="/"
            className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
          >
            Voltar ao Início
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Dúvidas? Entre em contato: <a href="mailto:cantosdememorias@gmail.com" className="text-yellow-600 hover:underline">cantosdememorias@gmail.com</a>
        </p>
      </div>
    </main>
  );
}
