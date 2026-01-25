'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Shield, Clock, Heart, Loader2, CheckCircle, ArrowLeft, Music, CreditCard, Copy, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { MetaPixelEvents } from '@/components/MetaPixel';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

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

interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  paymentId: string;
}

interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
  installments: number;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

// Componente do formulário de pagamento Stripe
function StripeCardForm({ orderId, amount, onSuccess, onError }: {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || 'Erro ao processar cartão');
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success?order_id=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        onError(confirmError.message || 'Erro ao confirmar pagamento');
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || 'Erro inesperado');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Stripe Payment Element */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Botão de pagamento */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pagar R$ {amount.toFixed(2).replace('.', ',')}
          </>
        )}
      </button>

      {/* Segurança */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock size={12} className="text-green-500" />
        <span>Pagamento seguro processado por Stripe</span>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'pix' | null>(null);
  const [mpReady, setMpReady] = useState(false);
  const [mp, setMp] = useState<any>(null);

  // PIX states
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Stripe states
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeOrderId, setStripeOrderId] = useState<string>('');

  // Card states
  const [cardForm, setCardForm] = useState<CardFormData>({
    cardNumber: '',
    cardholderName: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    identificationType: 'CPF',
    identificationNumber: '',
    installments: 1,
  });
  const [cardError, setCardError] = useState<string | null>(null);
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

  // Inicializar Mercado Pago SDK
  const initMercadoPago = useCallback(() => {
    if (window.MercadoPago && !mp) {
      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
      if (publicKey) {
        const mpInstance = new window.MercadoPago(publicKey, {
          locale: 'pt-BR'
        });
        setMp(mpInstance);
        setMpReady(true);
      }
    }
  }, [mp]);

  // Inicializar Stripe Payment Intent
  const initStripePayment = useCallback(async () => {
    if (!orderData || stripeClientSecret) return;

    setStripeLoading(true);
    setCardError(null);

    try {
      // Gerar ID do pedido para Stripe
      const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      setStripeOrderId(newOrderId);

      // Criar Payment Intent com dados completos do pedido
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'basico',
          customerEmail: orderData.customerEmail,
          customerName: orderData.customerName,
          orderId: newOrderId,
          orderData: {
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            customerWhatsapp: orderData.customerWhatsapp,
            honoreeName: orderData.honoreeName,
            relationship: orderData.relationship,
            relationshipLabel: orderData.relationshipLabel,
            occasion: orderData.occasion,
            occasionLabel: orderData.occasionLabel,
            musicStyle: orderData.musicStyle,
            musicStyleLabel: orderData.musicStyleLabel,
            voicePreference: orderData.voicePreference,
            qualities: orderData.qualities,
            memories: orderData.memories,
            heartMessage: orderData.heartMessage,
            familyNames: orderData.familyNames,
            approvedLyrics: orderData.approvedLyrics,
          },
        }),
      });

      const data = await response.json();

      if (data.error) {
        setCardError(data.error);
        setStripeLoading(false);
        return;
      }

      setStripeClientSecret(data.clientSecret);
    } catch (err: any) {
      setCardError(err.message || 'Erro ao inicializar pagamento');
    } finally {
      setStripeLoading(false);
    }
  }, [orderData, stripeClientSecret]);

  // Quando seleciona cartão, inicializa o Stripe
  useEffect(() => {
    if (selectedMethod === 'card' && orderData && !stripeClientSecret && !stripeLoading) {
      initStripePayment();
    }
  }, [selectedMethod, orderData, stripeClientSecret, stripeLoading, initStripePayment]);

  // Handler de sucesso do Stripe
  const handleStripeSuccess = useCallback(() => {
    if (orderData) {
      MetaPixelEvents.purchase({
        value: orderData.amount,
        content_name: `Música para ${orderData.honoreeName}`,
        content_ids: [stripeOrderId],
      });
    }

    setPaymentSuccess(true);
    sessionStorage.removeItem('checkoutData');
    setTimeout(() => {
      router.push(`/success?order_id=${stripeOrderId}`);
    }, 2000);
  }, [orderData, stripeOrderId, router]);

  // Handler de erro do Stripe
  const handleStripeError = useCallback((error: string) => {
    setCardError(error);
  }, []);

  // Verificar status do pagamento PIX
  const checkPixPayment = useCallback(async () => {
    if (!pixData?.paymentId) return;

    setCheckingPayment(true);
    try {
      const response = await fetch(`/api/mercadopago/check-payment?payment_id=${pixData.paymentId}`);
      const data = await response.json();

      if (data.status === 'approved') {
        // Meta Pixel: Evento Purchase (PIX)
        if (orderData) {
          MetaPixelEvents.purchase({
            value: orderData.amount,
            content_name: `Música para ${orderData.honoreeName}`,
            content_ids: [orderData.orderId],
          });
        }

        setPaymentSuccess(true);
        sessionStorage.removeItem('checkoutData');
        // Redirecionar para página de sucesso após 2 segundos
        setTimeout(() => {
          router.push(`/pagamento/sucesso?payment_id=${pixData.paymentId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    } finally {
      setCheckingPayment(false);
    }
  }, [pixData, router]);

  // Polling para verificar pagamento PIX
  useEffect(() => {
    if (pixData && !paymentSuccess) {
      const interval = setInterval(checkPixPayment, 5000);
      return () => clearInterval(interval);
    }
  }, [pixData, paymentSuccess, checkPixPayment]);

  // Processar pagamento PIX
  const handlePixPayment = async () => {
    if (!orderData) return;
    setLoading(true);
    setCardError(null);

    try {
      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'pix',
          amount: orderData.amount,
          description: `Música personalizada para ${orderData.honoreeName}`,
          payer: {
            email: orderData.customerEmail,
            first_name: orderData.customerName.split(' ')[0],
            last_name: orderData.customerName.split(' ').slice(1).join(' ') || orderData.customerName.split(' ')[0],
          },
          orderData: {
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

      if (data.pixQrCode && data.pixQrCodeBase64) {
        setPixData({
          qrCode: data.pixQrCode,
          qrCodeBase64: data.pixQrCodeBase64,
          paymentId: data.paymentId,
        });
      } else {
        throw new Error('Erro ao gerar QR Code PIX');
      }
    } catch (error: any) {
      console.error('Erro:', error);
      setCardError(error.message || 'Erro ao processar pagamento PIX');
    } finally {
      setLoading(false);
    }
  };

  // Processar pagamento com cartão
  const handleCardPayment = async () => {
    if (!orderData || !mp) return;
    setLoading(true);
    setCardError(null);

    try {
      // Criar token do cartão
      const cardTokenData = {
        cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
        cardholderName: cardForm.cardholderName,
        cardExpirationMonth: cardForm.expirationMonth,
        cardExpirationYear: cardForm.expirationYear,
        securityCode: cardForm.securityCode,
        identificationType: cardForm.identificationType,
        identificationNumber: cardForm.identificationNumber.replace(/[^\d]/g, ''),
      };

      const tokenResponse = await mp.createCardToken(cardTokenData);

      if (tokenResponse.error) {
        throw new Error(tokenResponse.error);
      }

      // Processar pagamento
      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'card',
          token: tokenResponse.id,
          amount: orderData.amount,
          installments: cardForm.installments,
          description: `Música personalizada para ${orderData.honoreeName}`,
          payer: {
            email: orderData.customerEmail,
            first_name: orderData.customerName.split(' ')[0],
            last_name: orderData.customerName.split(' ').slice(1).join(' ') || orderData.customerName.split(' ')[0],
            identification: {
              type: cardForm.identificationType,
              number: cardForm.identificationNumber.replace(/[^\d]/g, ''),
            },
          },
          orderData: {
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

      if (data.status === 'approved') {
        // Meta Pixel: Evento Purchase (Cartão)
        MetaPixelEvents.purchase({
          value: orderData.amount,
          content_name: `Música para ${orderData.honoreeName}`,
          content_ids: [orderData.orderId],
        });

        setPaymentSuccess(true);
        sessionStorage.removeItem('checkoutData');
        setTimeout(() => {
          router.push(`/pagamento/sucesso?payment_id=${data.paymentId}`);
        }, 2000);
      } else if (data.status === 'in_process' || data.status === 'pending') {
        setCardError('Pagamento em análise. Você receberá uma confirmação por e-mail.');
      } else {
        throw new Error(data.statusDetail || 'Pagamento não aprovado');
      }
    } catch (error: any) {
      console.error('Erro:', error);
      const errorMessage = getCardErrorMessage(error.message);
      setCardError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Traduzir erros do cartão
  const getCardErrorMessage = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'cc_rejected_insufficient_amount': 'Saldo insuficiente no cartão',
      'cc_rejected_bad_filled_card_number': 'Número do cartão inválido',
      'cc_rejected_bad_filled_date': 'Data de validade inválida',
      'cc_rejected_bad_filled_other': 'Dados do cartão inválidos',
      'cc_rejected_bad_filled_security_code': 'Código de segurança inválido',
      'cc_rejected_blacklist': 'Cartão não permitido',
      'cc_rejected_call_for_authorize': 'Autorize o pagamento junto ao seu banco',
      'cc_rejected_card_disabled': 'Cartão desabilitado',
      'cc_rejected_duplicated_payment': 'Pagamento duplicado',
      'cc_rejected_high_risk': 'Pagamento recusado por segurança',
      'cc_rejected_max_attempts': 'Limite de tentativas excedido',
      'cc_rejected_other_reason': 'Pagamento recusado pelo banco',
    };
    return errorMessages[error] || error || 'Erro ao processar pagamento';
  };

  // Copiar código PIX
  const copyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    }
  };

  // Formatar número do cartão
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ').substr(0, 19) : '';
  };

  // Formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
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
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        onLoad={initMercadoPago}
      />

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
              Pagamento 100% seguro
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
              /* Seleção de método de pagamento */
              <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Escolha como pagar</h2>

                <div className="space-y-3 mb-6">
                  {/* PIX */}
                  <button
                    onClick={() => {
                      setSelectedMethod('pix');
                      MetaPixelEvents.addPaymentInfo({ value: orderData.amount });
                    }}
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

                  {/* Cartão */}
                  <button
                    onClick={() => {
                      setSelectedMethod('card');
                      MetaPixelEvents.addPaymentInfo({ value: orderData.amount });
                    }}
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
                        Cartão de Crédito
                      </p>
                      <p className="text-sm text-green-600 font-medium">Parcele em até 12x</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === 'card' ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                    }`}>
                      {selectedMethod === 'card' && <CheckCircle size={14} className="text-white" />}
                    </div>
                  </button>
                </div>

                {/* Formulário de cartão com Stripe Elements */}
                {selectedMethod === 'card' && (
                  <div className="space-y-4 mb-6 animate-in slide-in-from-top-4">
                    {stripeLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Preparando pagamento...</p>
                      </div>
                    ) : stripeClientSecret ? (
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret: stripeClientSecret,
                          appearance: {
                            theme: 'stripe',
                            variables: {
                              colorPrimary: '#7c3aed',
                              borderRadius: '12px',
                            },
                          },
                          locale: 'pt-BR',
                        }}
                      >
                        <StripeCardForm
                          orderId={stripeOrderId}
                          amount={orderData.amount}
                          onSuccess={handleStripeSuccess}
                          onError={handleStripeError}
                        />
                      </Elements>
                    ) : cardError ? (
                      <div className="text-center py-6">
                        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                        <p className="text-red-600 text-sm mb-4">{cardError}</p>
                        <button
                          onClick={() => {
                            setCardError(null);
                            setStripeClientSecret(null);
                            initStripePayment();
                          }}
                          className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Carregando...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Formulário de cartão antigo (Mercado Pago - comentado)
                {selectedMethod === 'card-old' && (
                  <div className="space-y-4 mb-6 animate-in slide-in-from-top-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número do Cartão
                      </label>
                      <input
                        type="text"
                        value={cardForm.cardNumber}
                        onChange={(e) => setCardForm({ ...cardForm, cardNumber: formatCardNumber(e.target.value) })}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome no Cartão
                      </label>
                      <input
                        type="text"
                        value={cardForm.cardholderName}
                        onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value.toUpperCase() })}
                        placeholder="NOME COMO ESTÁ NO CARTÃO"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mês
                        </label>
                        <select
                          value={cardForm.expirationMonth}
                          onChange={(e) => setCardForm({ ...cardForm, expirationMonth: e.target.value })}
                          className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        >
                          <option value="">MM</option>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = (i + 1).toString().padStart(2, '0');
                            return <option key={month} value={month}>{month}</option>;
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ano
                        </label>
                        <select
                          value={cardForm.expirationYear}
                          onChange={(e) => setCardForm({ ...cardForm, expirationYear: e.target.value })}
                          className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        >
                          <option value="">AA</option>
                          {Array.from({ length: 15 }, (_, i) => {
                            const year = (new Date().getFullYear() + i).toString().slice(-2);
                            return <option key={year} value={year}>{year}</option>;
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardForm.securityCode}
                          onChange={(e) => setCardForm({ ...cardForm, securityCode: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPF/CNPJ do Titular
                      </label>
                      <input
                        type="text"
                        value={cardForm.identificationNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setCardForm({
                            ...cardForm,
                            identificationNumber: formatCPF(value),
                            identificationType: value.length > 11 ? 'CNPJ' : 'CPF'
                          });
                        }}
                        placeholder="000.000.000-00"
                        maxLength={18}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Parcelas
                      </label>
                      <select
                        value={cardForm.installments}
                        onChange={(e) => setCardForm({ ...cardForm, installments: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value={1}>1x de R$ {orderData.amount.toFixed(2).replace('.', ',')} (sem juros)</option>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                          <option key={n} value={n}>
                            {n}x de R$ {(orderData.amount / n).toFixed(2).replace('.', ',')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                */}

                {/* Mensagem de erro para PIX */}
                {cardError && selectedMethod === 'pix' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {cardError}
                  </div>
                )}

                {/* Botão Pagar PIX */}
                {selectedMethod === 'pix' && (
                  <button
                    onClick={handlePixPayment}
                    disabled={loading}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Gerando PIX...
                      </>
                    ) : (
                      <>
                        <Shield size={20} />
                        Gerar QR Code PIX
                      </>
                    )}
                  </button>
                )}
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
            Cartão: <span className="font-semibold text-violet-500">Stripe</span> | PIX: <span className="font-semibold text-blue-500">Mercado Pago</span>
          </p>
        </div>
      </div>
    </>
  );
}
