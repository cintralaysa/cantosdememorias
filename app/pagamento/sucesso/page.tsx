'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Music, Clock, MessageCircle, ArrowLeft, Sparkles, Loader2, Download, Mail, KeyRound, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { MetaPixelEvents } from '@/components/MetaPixel';

const PROGRESS_MESSAGES = [
  'Analisando a melodia perfeita...',
  'Compondo acordes especiais...',
  'Criando uma voz única para sua música...',
  'Harmonizando notas e sentimentos...',
  'Ajustando os detalhes finais...',
  'Quase lá! Polindo a produção...',
  'Dando os toques finais na sua música...',
];

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get('payment_id');
  const value = searchParams.get('value');
  const plan = searchParams.get('plan');
  const orderId = searchParams.get('orderId') || paymentId;
  const [showConfetti, setShowConfetti] = useState(true);
  const [musicStatus, setMusicStatus] = useState<string>('pending');
  const [musicError, setMusicError] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [progressMsg, setProgressMsg] = useState(0);
  const [pollCount, setPollCount] = useState(0);
  const pixelFired = useRef(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Cronometro + mensagem de progresso ciclica
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    const msgInterval = setInterval(() => {
      setProgressMsg(prev => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(msgInterval);
    };
  }, []);

  // Polling do status da musica
  useEffect(() => {
    if (!orderId) return;

    const checkMusic = async () => {
      try {
        const res = await fetch(`/api/music/status/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setMusicStatus(data.musicStatus || 'pending');
          if (data.accessCode) setAccessCode(data.accessCode);
          if (data.musicError) setMusicError(data.musicError);
          setPollCount(prev => prev + 1);
          if (data.musicStatus === 'completed') {
            router.push(`/musica/${orderId}`);
          }
        }
      } catch {}
    };

    checkMusic();
    const interval = setInterval(checkMusic, 5000);
    return () => clearInterval(interval);
  }, [orderId, router]);

  // Meta Pixel
  useEffect(() => {
    if (!pixelFired.current) {
      pixelFired.current = true;
      const purchaseValue = value ? parseFloat(value) : (plan === 'premium' ? 79.90 : 39.90);
      MetaPixelEvents.purchase({
        value: purchaseValue,
        currency: 'BRL',
        content_name: plan === 'premium' ? 'Plano Premium' : 'Plano Essencial',
        content_ids: [paymentId || 'unknown'],
      });
    }
  }, [value, plan, paymentId]);

  const isActive = musicStatus === 'generating' || musicStatus === 'pending';
  const isFailed = musicStatus === 'failed';
  const isCompleted = musicStatus === 'completed';

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `0:${sec.toString().padStart(2, '0')}`;
  };

  // Porcentagem estimada (crescimento logaritmico ate 95%)
  const estimatedProgress = Math.min(95, Math.max(5, Math.log(1 + elapsedSeconds / 20) * 30));

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-violet-50 relative overflow-hidden">
      {/* Confetti */}
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

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
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
            Sua música está sendo criada agora mesmo!
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Banner verde */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle size={20} />
              <span className="font-bold">Pagamento recebido com sucesso!</span>
            </div>
          </div>

          {/* Seção de geração ativa */}
          {isActive && (
            <div className="p-6 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
              {/* Indicador LIVE */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Criando ao vivo</span>
                </div>
                <span className="text-sm font-mono font-bold text-violet-700 bg-violet-100 px-3 py-1 rounded-full">
                  {formatElapsed(elapsedSeconds)}
                </span>
              </div>

              {/* Animação de ondas sonoras */}
              <div className="flex items-center justify-center gap-1 mb-4 h-16">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-violet-500 to-purple-400 rounded-full transition-all"
                    style={{
                      animation: `soundWave 1.2s ease-in-out infinite`,
                      animationDelay: `${i * 0.06}s`,
                      height: '8px',
                    }}
                  />
                ))}
              </div>

              {/* Mensagem de progresso ciclica */}
              <div className="text-center mb-4">
                <p className="text-violet-800 font-semibold text-base animate-fade-in" key={progressMsg}>
                  {PROGRESS_MESSAGES[progressMsg]}
                </p>
              </div>

              {/* Barra de progresso */}
              <div className="relative w-full h-3 bg-violet-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${estimatedProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
              <p className="text-xs text-violet-500 text-center mt-2">
                Tempo estimado: 2 a 5 minutos
              </p>
            </div>
          )}

          {/* Se falhou */}
          {isFailed && (
            <div className="p-6 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">Houve um problema na criação</p>
                  <p className="text-sm text-red-600 mt-1">
                    {musicError || 'Ocorreu um erro ao gerar sua música.'}
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    Não se preocupe! Nossa equipe já foi notificada e entraremos em contato pelo WhatsApp para resolver.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Etapas resumidas */}
          <div className="p-5 border-t">
            <div className="flex items-center justify-between">
              {/* Step 1 - Pagamento */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-1">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-[10px] font-semibold text-green-700">Pago</span>
              </div>

              <div className="h-0.5 flex-1 bg-green-300 -mt-4" />

              {/* Step 2 - Criando */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  isActive ? 'bg-violet-100 ring-2 ring-violet-400 ring-offset-2' :
                  isCompleted ? 'bg-green-100' :
                  isFailed ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {isActive ? (
                    <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : isFailed ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Music className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${
                  isActive ? 'text-violet-700' :
                  isCompleted ? 'text-green-700' :
                  isFailed ? 'text-red-600' : 'text-gray-400'
                }`}>
                  {isActive ? 'Criando...' : isCompleted ? 'Pronta!' : isFailed ? 'Erro' : 'Criar'}
                </span>
              </div>

              <div className={`h-0.5 flex-1 -mt-4 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />

              {/* Step 3 - Email */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  isCompleted ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Mail className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-gray-300'}`} />
                </div>
                <span className={`text-[10px] font-semibold ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>
                  E-mail
                </span>
              </div>

              <div className={`h-0.5 flex-1 -mt-4 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />

              {/* Step 4 - Pronto */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  isCompleted ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <Download className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-gray-300'}`} />
                </div>
                <span className={`text-[10px] font-semibold ${isCompleted ? 'text-green-700' : 'text-gray-400'}`}>
                  Baixar
                </span>
              </div>
            </div>
          </div>

          {/* Codigo de acesso */}
          {accessCode && (
            <div className="p-5 border-t bg-amber-50">
              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 text-sm">Seu codigo de acesso:</p>
                  <p className="text-xl font-black font-mono tracking-widest text-violet-600 my-1">{accessCode}</p>
                  <p className="text-xs text-amber-700">
                    Guarde este codigo! Acesse sua musica em <strong>cantosdememorias.com.br/acesso</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info sobre email */}
          <div className="p-5 border-t bg-blue-50">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-semibold">
                  {isActive
                    ? 'Pode fechar esta pagina!'
                    : 'Fique de olho no seu e-mail!'}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {isActive
                    ? 'Quando a musica ficar pronta, enviaremos tudo por e-mail: link para ouvir, baixar o MP3 e a letra completa. Voce nao precisa ficar aqui!'
                    : 'Enviaremos o link de download, a letra completa e seu codigo de acesso. Verifique tambem a caixa de spam.'}
                </p>
              </div>
            </div>
          </div>

          {/* Status de conexao (mostra que esta atualizando) */}
          {isActive && pollCount > 0 && (
            <div className="px-5 py-2 border-t bg-gray-50 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-gray-400">Verificando status automaticamente...</span>
            </div>
          )}
        </div>

        {/* Botoes */}
        <div className="space-y-3">
          {orderId && (
            <Link
              href={`/musica/${orderId}`}
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <Music size={20} />
              Ver minha musica
            </Link>
          )}

          <Link
            href="/acesso"
            className="w-full py-3 bg-white hover:bg-gray-50 text-violet-700 border-2 border-violet-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <KeyRound size={18} />
            Acessar com codigo
          </Link>

          <a
            href="https://wa.me/5588992422920"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <MessageCircle size={20} />
            Falar no WhatsApp
          </a>

          <Link
            href="/"
            className="w-full py-3 bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-sm"
          >
            <ArrowLeft size={16} />
            Voltar para o inicio
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Obrigado por escolher a Cantos de Memorias!</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall { animation: fall linear forwards; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        @keyframes soundWave {
          0%, 100% { height: 8px; }
          50% { height: 40px; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}
