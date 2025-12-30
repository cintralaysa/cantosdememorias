'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Music, Clock, Mail, MessageCircle, Heart, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Esconder confetti após 5 segundos
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-violet-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'][Math.floor(Math.random() * 5)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30 animate-bounce-slow">
              <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Sparkles className="w-5 h-5 text-yellow-800" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Pagamento Confirmado! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Obrigado por escolher a <span className="text-violet-600 font-semibold">Cantos de Memórias</span>
          </p>
        </div>

        {/* Order ID */}
        {orderId && (
          <div className="bg-green-100 border border-green-300 rounded-2xl p-4 mb-6 text-center">
            <p className="text-sm text-green-700">
              <span className="font-medium">Pedido:</span> <span className="font-bold">#{orderId}</span>
            </p>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white text-center">
            <Music className="w-10 h-10 mx-auto mb-3 opacity-90" />
            <h2 className="text-xl font-bold mb-1">Sua música está sendo criada!</h2>
            <p className="text-white/80 text-sm">Com todo carinho e dedicação</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Timeline */}
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">O que acontece agora:</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pagamento confirmado</p>
                  <p className="text-sm text-gray-500">Seu pedido foi recebido com sucesso</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Music className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Produção em andamento</p>
                  <p className="text-sm text-gray-500">Nossa equipe já está trabalhando na sua música</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Contato via WhatsApp</p>
                  <p className="text-sm text-gray-500">Você receberá uma mensagem em breve</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Entrega em até 24 horas</p>
                  <p className="text-sm text-gray-500">No seu email e WhatsApp</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What you'll receive */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-violet-800 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            O que você vai receber:
          </h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
              <span className="text-gray-700">1 letra exclusiva e personalizada</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
              <span className="text-gray-700">2 melodias diferentes</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 bg-violet-600 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
              <span className="text-gray-700">Arquivos em alta qualidade (MP3)</span>
            </li>
          </ul>
        </div>

        {/* Email Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Enviamos um email de confirmação!</span>
              <br />
              <span className="text-blue-600">Verifique sua caixa de entrada e spam.</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] transition-all duration-300"
        >
          Voltar ao Início
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Dúvidas? Entre em contato pelo email <br />
          <a href="mailto:cantosdememorias@gmail.com" className="text-violet-600 font-medium hover:underline">
            cantosdememorias@gmail.com
          </a>
        </p>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
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
    </main>
  );
}
