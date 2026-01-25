'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, CreditCard, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Componente do formulário de pagamento
function CardPaymentForm({ orderId, amount, planName, onSuccess }: {
  orderId: string;
  amount: number;
  planName: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Erro ao processar cartão');
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
        setError(confirmError.message || 'Erro ao confirmar pagamento');
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resumo */}
      <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{planName}</span>
          <span className="text-2xl font-bold text-violet-600">
            R$ {(amount / 100).toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

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
            Pagar R$ {(amount / 100).toFixed(2).replace('.', ',')}
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

// Página principal
export default function CardCheckoutPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const PLANS = {
    basico: { name: 'Plano Básico', price: 5990 },
    premium: { name: 'Plano Premium', price: 7990 },
  };

  useEffect(() => {
    const initPayment = async () => {
      try {
        // Recuperar dados do pedido do localStorage
        const savedOrder = localStorage.getItem('pendingOrder');
        if (!savedOrder) {
          setError('Dados do pedido não encontrados. Por favor, volte e tente novamente.');
          setLoading(false);
          return;
        }

        const order = JSON.parse(savedOrder);
        setOrderData(order);

        // Gerar ID do pedido
        const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        setOrderId(newOrderId);

        // Criar Payment Intent
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: order.plan,
            customerEmail: order.customerEmail,
            customerName: order.customerName,
            orderId: newOrderId,
          }),
        });

        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        setClientSecret(data.clientSecret);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Erro ao inicializar pagamento');
        setLoading(false);
      }
    };

    initPayment();
  }, []);

  const handleSuccess = () => {
    setSuccess(true);
    localStorage.removeItem('pendingOrder');
    // Redirecionar após 2 segundos
    setTimeout(() => {
      router.push(`/success?order_id=${orderId}`);
    }, 2000);
  };

  // Tela de sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0620] to-[#1a1333] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h2>
          <p className="text-gray-600 mb-4">
            Sua música para <strong>{orderData?.honoreeName}</strong> está sendo preparada com muito carinho.
          </p>
          <div className="bg-violet-50 rounded-xl p-4">
            <p className="text-sm text-violet-700">
              Você receberá sua música no WhatsApp cadastrado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0620] to-[#1a1333] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Preparando pagamento...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0620] to-[#1a1333] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const plan = PLANS[orderData?.plan as keyof typeof PLANS] || PLANS.basico;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0620] to-[#1a1333] py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Pagamento com Cartão</h1>
              <p className="text-white/60 text-sm">Preencha os dados do cartão</p>
            </div>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
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
              <CardPaymentForm
                orderId={orderId}
                amount={plan.price}
                planName={plan.name}
                onSuccess={handleSuccess}
              />
            </Elements>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs">
            Música para: <strong className="text-white/70">{orderData?.honoreeName}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
