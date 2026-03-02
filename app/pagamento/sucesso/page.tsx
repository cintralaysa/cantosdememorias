'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Music, Clock, MessageCircle, Heart, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MetaPixelEvents } from '@/components/MetaPixel';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('payment_id');
  const value = searchParams.get('value');
  const plan = searchParams.get('plan');
  const orderId = searchParams.get('orderId') || paymentId;
  const [showConfetti, setShowConfetti] = useState(true);
  const [musicStatus, setMusicStatus] = useState<string>('pending');
  const pixelFired = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Polling do status da música
  useEffect(() => {
    if (!orderId) return;

    const checkMusic = async () => {
      try {
        const res = await fetch(`/api/music/status/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setMusicStatus(data.musicStatus || 'pending');
          if (data.musicStatus === 'completed') {
            // Música pronta! Redirecionar
            router.push(`/musica/${orderId}`);
          }
        }
      } catch {}
    };

    checkMusic();
    const interval = setInterval(checkMusic, 8000);
    return () => clearInterval(interval);
  }, [orderId, router]);

  // Disparar evento de Purchase do Meta Pixel
  useEffect(() => {
    if (!pixelFired.current) {
      pixelFired.current = true;

      // Pegar valor do pedido (da URL ou usar valor padrão baseado no plano)
      const purchaseValue = value ? parseFloat(value) : (plan === 'premium' ? 79.90 : 59.90);

      MetaPixelEvents.purchase({
        value: purchaseValue,
        currency: 'BRL',
        content_name: plan === 'premium' ? 'Plano Premium' : 'Plano Essencial',
        content_ids: [paymentId || 'unknown'],
      });

      console.log('[Meta Pixel] Purchase event fired:', { value: purchaseValue, plan });
    }
  }, [value, plan, paymentId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-violet-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Background decorations */}
      <div className="absolute top-20 left-10 text-6xl opacity-10 animate-pulse">
        <Music />
      </div>
      <div className="absolute bottom-20 right-10 text-6xl opacity-10 animate-pulse">
        <Heart />
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pagamento Confirmado!
          </h1>
          <p className="text-gray-600 text-lg">
            Sua música personalizada está sendo criada automaticamente
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Status */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle size={24} />
              <span className="font-bold text-lg">Pedido Recebido</span>
            </div>
            {paymentId && (
              <p className="text-sm opacity-90">
                ID do pagamento: {paymentId}
              </p>
            )}
          </div>

          {/* Status da geração */}
          {musicStatus === 'generating' && (
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 border-t">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-violet-600 animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg">Criando sua música...</p>
                  <p className="text-violet-700 font-semibold">Tempo estimado: 2-3 minutos</p>
                  <p className="text-sm text-gray-600">Você será redirecionado automaticamente</p>
                </div>
              </div>
              <div className="mt-3 w-full h-2 bg-violet-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {/* O que acontece agora */}
          <div className="p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">
              O que acontece agora?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pagamento confirmado</p>
                  <p className="text-sm text-gray-600">
                    Recebemos seu pagamento e já estamos gerando sua música
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 ${musicStatus === 'generating' ? 'bg-violet-100' : 'bg-gray-100'} rounded-full flex items-center justify-center flex-shrink-0`}>
                  {musicStatus === 'generating' ? (
                    <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                  ) : (
                    <Music className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Criação automática da música</p>
                  <p className="text-sm text-gray-600">
                    Nossa IA está compondo melodias únicas baseadas na sua letra
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400 font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ouça e baixe sua música</p>
                  <p className="text-sm text-gray-600">
                    Quando pronta, você será redirecionado para ouvir, baixar e compartilhar
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tempo estimado */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 border-t">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center">
                <Clock className="w-7 h-7 text-violet-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Tempo estimado</p>
                <p className="text-violet-700 font-semibold">2 a 5 minutos</p>
                <p className="text-sm text-gray-600">Fique nesta página ou aguarde o email</p>
              </div>
            </div>
          </div>

          {/* Confirmação por email */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Você receberá um e-mail quando a música estiver pronta, com link para ouvir e baixar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <a
            href="https://wa.me/5588992422920"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <MessageCircle size={22} />
            Falar no WhatsApp
          </a>

          <Link
            href="/"
            className="w-full py-4 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft size={20} />
            Voltar para o início
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Obrigado por escolher a Cantos de Memórias!</p>
          <p className="mt-1">Transformando sentimentos em música</p>
        </div>
      </div>

      {/* CSS para animação */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
