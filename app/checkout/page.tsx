'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Clock, Heart, Loader2, CheckCircle, ArrowLeft, Music, Copy, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { MetaPixelEvents } from '@/components/MetaPixel';

interface OrderData {
  orderId: string;
  plan?: string;
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

interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  paymentId: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);

  // PIX states
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Recuperar dados do pedido
  useEffect(() => {
    const storedData = sessionStorage.getItem('checkoutData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setOrderData(data);

        // Meta Pixel: Evento InitiateCheckout
        MetaPixelEvents.initiateCheckout({
          value: data.amount,
          content_name: `Música para ${data.honoreeName}`,
        });
      } catch (e) {
        console.error('Erro ao recuperar dados do pedido:', e);
      }
    }
  }, []);

  // Verificar status do pagamento PIX (via OpenPix/Woovi)
  const checkPixPayment = useCallback(async () => {
    if (!pixData?.paymentId) return;

    setCheckingPayment(true);
    try {
      const response = await fetch(`/api/pix/status?correlationID=${pixData.paymentId}`);
      const data = await response.json();

      if (data.status === 'COMPLETED' || data.status === 'approved') {
        if (orderData) {
          MetaPixelEvents.purchase({
            value: orderData.amount,
            content_name: `Música para ${orderData.honoreeName}`,
            content_ids: [orderData.orderId],
          });
        }

        setPaymentSuccess(true);
        sessionStorage.removeItem('checkoutData');
        setTimeout(() => {
          router.push(`/pagamento/sucesso?payment_id=${pixData.paymentId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    } finally {
      setCheckingPayment(false);
    }
  }, [pixData, router, orderData]);

  // Polling para verificar pagamento PIX
  useEffect(() => {
    if (pixData && !paymentSuccess) {
      const interval = setInterval(checkPixPayment, 5000);
      return () => clearInterval(interval);
    }
  }, [pixData, paymentSuccess, checkPixPayment]);

  // Processar pagamento PIX (via OpenPix/Woovi)
  const handlePixPayment = async () => {
    if (!orderData) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: orderData.plan,
          amount: orderData.amount,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          orderId: orderData.orderId,
          description: `Música personalizada para ${orderData.honoreeName}`,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.qrCode && data.qrCodeBase64) {
        setPixData({
          qrCode: data.qrCode,
          qrCodeBase64: data.qrCodeBase64,
          paymentId: data.correlationID || data.paymentId,
        });
      } else {
        throw new Error('Erro ao gerar QR Code PIX');
      }

      MetaPixelEvents.addPaymentInfo({ value: orderData.amount });
    } catch (error: any) {
      console.error('Erro:', error);
      setError(error.message || 'Erro ao processar pagamento PIX');
    } finally {
      setLoading(false);
    }
  };

  // Copiar código PIX
  const copyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    }
  };

  // Se pagamento foi sucesso
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h1>
          <p className="text-gray-600 mb-6">Sua música está sendo preparada com muito carinho.</p>
          <p className="text-sm text-gray-500">Redirecionando...</p>
        </div>
      </div>
    );
  }

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
    <>
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
            <h1 className="text-xl font-bold mb-1">Finalizar Pagamento</h1>
            <p className="text-white/80 text-sm">
              Pagamento 100% seguro via PIX
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

            {/* Se já tem dados do PIX, mostrar QR Code */}
            {pixData ? (
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Pague com PIX</h2>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-center mb-4">
                    <img
                      src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>

                  <p className="text-center text-sm text-gray-600 mb-4">
                    Escaneie o QR Code ou copie o código abaixo
                  </p>

                  <div className="bg-white border rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500 font-mono break-all">
                      {pixData.qrCode.substring(0, 50)}...
                    </p>
                  </div>

                  <button
                    onClick={copyPixCode}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                  >
                    {pixCopied ? (
                      <>
                        <CheckCircle size={20} />
                        Código Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={20} />
                        Copiar Código PIX
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  {checkingPayment ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  <span>Aguardando confirmação do pagamento...</span>
                </div>

                <button
                  onClick={checkPixPayment}
                  disabled={checkingPayment}
                  className="w-full mt-4 py-2 text-violet-600 hover:text-violet-700 font-medium text-sm"
                >
                  Verificar pagamento manualmente
                </button>
              </div>
            ) : (
              /* Botão para gerar PIX */
              <div className="p-5">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 512 512" className="w-5 h-5 fill-white">
                        <path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-green-800">Pagamento via PIX</p>
                      <p className="text-sm text-green-600">Aprovação instantânea</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-700">
                    Ao clicar no botão abaixo, um QR Code será gerado para você realizar o pagamento.
                  </p>
                </div>

                {/* Mensagem de erro */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePixPayment}
                  disabled={loading}
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    <>
                      <Shield size={20} />
                      Pagar R$ {orderData.amount.toFixed(2).replace('.', ',')} com PIX
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-green-500" />
              <span>Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-violet-500" />
              <span>Entrega em 48h</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart size={14} className="text-red-400" />
              <span>+2.000 clientes</span>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            PIX: <span className="font-semibold text-green-500">Woovi</span>
          </p>
        </div>
      </div>
    </>
  );
}
