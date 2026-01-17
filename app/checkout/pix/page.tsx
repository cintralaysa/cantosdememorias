'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  pixCopiaECola: string;
  expiresAt: string;
  value: number;
  valueFormatted: string;
}

export default function CheckoutPixPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [correlationID, setCorrelationID] = useState<string>('');
  const [orderPlan, setOrderPlan] = useState<string>('basico');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'waiting' | 'paid' | 'expired'>('waiting');
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Carregar dados do pedido do localStorage e criar PIX
  useEffect(() => {
    const createPix = async () => {
      try {
        const savedOrder = localStorage.getItem('pendingOrder');
        if (!savedOrder) {
          setError('Dados do pedido não encontrados. Por favor, refaça o pedido.');
          setLoading(false);
          return;
        }

        const orderData = JSON.parse(savedOrder);

        // Guardar o plano para usar no redirecionamento
        setOrderPlan(orderData.plan || 'basico');

        const response = await fetch('/api/pix/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error('Erro ao gerar PIX');
        }

        const data = await response.json();

        if (data.success && data.pixData) {
          setPixData(data.pixData);
          setOrderId(data.orderId);
          setCorrelationID(data.correlationID);
        } else {
          throw new Error(data.error || 'Erro ao gerar QR Code');
        }
      } catch (err) {
        console.error('Erro:', err);
        setError('Não foi possível gerar o QR Code PIX. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    createPix();
  }, []);

  // Verificar status do pagamento periodicamente
  const checkPaymentStatus = useCallback(async () => {
    if (!correlationID || status !== 'waiting') return;

    setCheckingPayment(true);
    try {
      const response = await fetch(`/api/pix/status?correlationID=${correlationID}`);
      const data = await response.json();

      if (data.isPaid) {
        setStatus('paid');
        localStorage.removeItem('pendingOrder');
        // Redirecionar para página de sucesso após 2 segundos com dados para o Meta Pixel
        setTimeout(() => {
          const value = pixData?.value || (orderPlan === 'premium' ? 79.90 : 49.90);
          router.push(`/pagamento/sucesso?orderId=${orderId}&value=${value}&plan=${orderPlan}`);
        }, 2000);
      } else if (data.isExpired) {
        setStatus('expired');
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    } finally {
      setCheckingPayment(false);
    }
  }, [correlationID, status, orderId, orderPlan, pixData, router]);

  // Polling do status a cada 5 segundos
  useEffect(() => {
    if (!correlationID || status !== 'waiting') return;

    const interval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [correlationID, status, checkPaymentStatus]);

  // Copiar código PIX
  const copyPixCode = async () => {
    if (!pixData?.pixCopiaECola) return;

    try {
      await navigator.clipboard.writeText(pixData.pixCopiaECola);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = pixData.pixCopiaECola;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl">Gerando QR Code PIX...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Ops! Algo deu errado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (status === 'paid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="text-7xl mb-4 animate-bounce">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">Pagamento Confirmado!</h1>
          <p className="text-gray-600 mb-2">Seu pedido foi recebido com sucesso.</p>
          <p className="text-gray-600 mb-6">Redirecionando...</p>
          <div className="animate-pulse text-green-500">
            <div className="h-2 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-[loading_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-orange-600 mb-4">QR Code Expirado</h1>
          <p className="text-gray-600 mb-6">O tempo para pagamento expirou. Por favor, gere um novo QR Code.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Gerar novo QR Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Pagamento PIX</h1>
          <p className="text-purple-200">Escaneie o QR Code ou copie o código</p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Valor */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-center">
            <p className="text-purple-100 text-sm mb-1">Valor a pagar</p>
            <p className="text-4xl font-bold text-white">{pixData?.valueFormatted || 'R$ 49,90'}</p>
          </div>

          {/* QR Code */}
          <div className="p-6">
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              {pixData?.qrCodeBase64 ? (
                <div className="relative w-64 h-64 mx-auto">
                  <img
                    src={pixData.qrCodeBase64}
                    alt="QR Code PIX"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">QR Code não disponível</p>
                </div>
              )}
            </div>

            {/* Código Copia e Cola */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2 text-center">Ou copie o código PIX:</p>
              <div className="relative">
                <input
                  type="text"
                  value={pixData?.pixCopiaECola || ''}
                  readOnly
                  className="w-full p-3 pr-24 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono truncate"
                />
                <button
                  onClick={copyPixCode}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {copied ? '✓ Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Status de verificação */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${checkingPayment ? 'bg-yellow-500 animate-pulse' : 'bg-yellow-400'}`}></div>
                <p className="text-yellow-800 text-sm">
                  {checkingPayment ? 'Verificando pagamento...' : 'Aguardando pagamento...'}
                </p>
              </div>
              <p className="text-yellow-600 text-xs mt-2">
                Esta página será atualizada automaticamente quando o pagamento for confirmado.
              </p>
            </div>

            {/* Instruções */}
            <div className="space-y-3 text-sm text-gray-600">
              <p className="font-semibold text-gray-800">Como pagar:</p>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <p>Abra o app do seu banco</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <p>Escolha pagar com PIX e escaneie o QR Code ou cole o código</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <p>Confirme o pagamento e pronto!</p>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="bg-gray-50 p-4 text-center">
            <p className="text-xs text-gray-500">
              Pedido #{orderId}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Pagamento processado com segurança
            </p>
          </div>
        </div>

        {/* Voltar */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-purple-200 hover:text-white transition text-sm"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
