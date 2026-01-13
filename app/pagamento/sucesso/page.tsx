'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Music, Clock, MessageCircle, Heart, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Esconder confetti após 5 segundos
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

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
            Sua música personalizada está sendo criada com muito carinho
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

          {/* O que acontece agora */}
          <div className="p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">
              O que acontece agora?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Recebemos seu pedido</p>
                  <p className="text-sm text-gray-600">
                    Nossa equipe já está ciente e começará a trabalhar na sua música
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Criação da música</p>
                  <p className="text-sm text-gray-600">
                    Vamos criar 2 melodias diferentes baseadas na letra que você aprovou
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Entrega no WhatsApp</p>
                  <p className="text-sm text-gray-600">
                    Você receberá as músicas diretamente no seu WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Prazo */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 border-t">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Prazo de entrega</p>
                <p className="text-amber-700 font-semibold">Até 48 horas</p>
                <p className="text-sm text-gray-600">Direto no seu WhatsApp</p>
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
                  Enviamos uma confirmação para o seu e-mail com todos os detalhes do pedido.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <a
            href="https://wa.me/5585996811925"
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
