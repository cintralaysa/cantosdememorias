'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Music, Download, FileText, Share2, Play, Pause, ArrowLeft, Clock, CheckCircle2, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface MusicStatus {
  orderId: string;
  musicStatus: 'pending' | 'generating' | 'completed' | 'failed';
  musicUrls: string[];
  accessCode: string;
  honoreeName: string;
  customerName: string;
  occasion: string;
  musicStyle: string;
  plan: string;
  generatedLyrics: string;
  musicStartedAt: string;
  musicCompletedAt: string;
  musicError: string;
  estimatedSeconds: number;
}

export default function MusicaPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [data, setData] = useState<MusicStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Buscar status da música
  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/music/status/${orderId}`);
      if (!res.ok) {
        setError('Pedido não encontrado');
        setLoading(false);
        return;
      }
      const result = await res.json();
      setData(result);
      setLoading(false);
    } catch {
      setError('Erro ao buscar status');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [orderId]);

  // Polling enquanto está gerando
  useEffect(() => {
    if (data?.musicStatus === 'generating' || data?.musicStatus === 'pending') {
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [data?.musicStatus]);

  const togglePlay = () => {
    if (!audioRef.current || !data?.musicUrls?.length) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copyAccessCode = () => {
    if (data?.accessCode) {
      navigator.clipboard.writeText(data.accessCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    if (!data) return;
    const text = `🎵 Olha a música que eu fiz para ${data.honoreeName}! Ouve aqui: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const downloadLyrics = () => {
    if (!data?.generatedLyrics) return;
    const blob = new Blob([data.generatedLyrics], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `letra-${data.honoreeName || 'musica'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0620] via-[#1a0f3a] to-[#0f0a1e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0620] via-[#1a0f3a] to-[#0f0a1e] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Pedido não encontrado</h1>
          <p className="text-white/60 mb-6">{error || 'Não foi possível encontrar este pedido.'}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-full font-bold hover:bg-violet-500 transition">
            <ArrowLeft size={16} />
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  // Gerando música (animação de espera)
  if (data.musicStatus === 'generating' || data.musicStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0620] via-[#1a0f3a] to-[#0f0a1e] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Music className="w-10 h-10 text-violet-400" />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Criando sua música...</h1>
          <p className="text-white/60 mb-6">
            A música de <strong className="text-violet-300">{data.honoreeName}</strong> está sendo gerada com inteligência artificial.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 text-violet-300 mb-3">
              <Clock size={16} />
              <span className="text-sm font-medium">Tempo estimado: 2-3 minutos</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(95, Math.max(10, 100 - (data.estimatedSeconds / 180) * 100))}%` }}
              />
            </div>
            <p className="text-xs text-white/40 mt-2">Esta página atualiza automaticamente</p>
          </div>
          <div className="flex items-center gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Falha na geração
  if (data.musicStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0d0620] via-[#1a0f3a] to-[#0f0a1e] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Estamos finalizando sua música</h1>
          <p className="text-white/60 mb-6">
            Nossa equipe está trabalhando na música de <strong className="text-violet-300">{data.honoreeName}</strong>. Você receberá um email assim que ficar pronta!
          </p>
          <a
            href="https://wa.me/5588992422920?text=Olá! Fiz um pedido (ID: {data.orderId}) e gostaria de saber o status da minha música."
            target="_blank"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition"
          >
            <Share2 size={16} />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    );
  }

  // ==========================================
  // MÚSICA PRONTA! (status === 'completed')
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0620] via-[#1a0f3a] to-[#0f0a1e]">
      {/* Audio Element */}
      {data.musicUrls[currentTrack] && (
        <audio
          ref={audioRef}
          src={data.musicUrls[currentTrack]}
          preload="metadata"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header */}
      <header className="px-4 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-white/60 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold">
              <span className="text-violet-400">Sua música</span> <span className="text-white">está pronta!</span>
            </h1>
            <p className="text-white/50 text-sm">Música para {data.honoreeName}</p>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="px-4 pb-10">
        <div className="max-w-2xl mx-auto">
          {/* Celebração */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎉🎵</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              <span className="text-green-400">Parabéns!</span> Sua música está pronta!
            </h2>
            <p className="text-white/60 text-sm">
              A música de {data.honoreeName} foi gerada com sucesso!
            </p>
          </div>

          {/* Player */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 sm:p-6 mb-4">
            {/* Track selector (se tem mais de 1 música) */}
            {data.musicUrls.length > 1 && (
              <div className="flex gap-2 mb-4">
                {data.musicUrls.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentTrack(i);
                      setIsPlaying(false);
                      setCurrentTime(0);
                    }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition ${
                      currentTrack === i
                        ? 'bg-violet-500 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                    }`}
                  >
                    Melodia {i + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Play button + info */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={togglePlay}
                className="w-14 h-14 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 hover:scale-105 transition flex-shrink-0"
              >
                {isPlaying ? <Pause size={22} className="text-white" /> : <Play size={22} className="text-white ml-1" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">Música para {data.honoreeName}</p>
                <p className="text-white/50 text-xs">{data.musicStyle} {data.plan === 'premium' ? '• Premium' : ''}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div
                className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  if (audioRef.current && duration > 0) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    audioRef.current.currentTime = pct * duration;
                  }
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-200"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-white/40">{formatTime(currentTime)}</span>
                <span className="text-xs text-white/40">{formatTime(duration)}</span>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3 mb-6">
            {/* Download MP3 */}
            <a
              href={data.musicUrls[currentTrack]}
              download={`musica-${data.honoreeName}.mp3`}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-xl font-bold text-base hover:from-violet-400 hover:to-purple-500 transition shadow-lg shadow-violet-500/20"
            >
              <Download size={20} />
              Baixar música (MP3)
            </a>

            {/* Download Letra */}
            {data.generatedLyrics && (
              <button
                onClick={downloadLyrics}
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/20 text-white py-3.5 rounded-xl font-medium text-sm hover:bg-white/10 transition"
              >
                <FileText size={18} />
                Baixar letra (.txt)
              </button>
            )}

            {/* Compartilhar WhatsApp */}
            <button
              onClick={shareWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/20 text-white py-3.5 rounded-xl font-medium text-sm hover:bg-white/10 transition"
            >
              <Share2 size={18} />
              Enviar pelo WhatsApp
            </button>
          </div>

          {/* Código de acesso */}
          {data.accessCode && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center mb-6">
              <p className="text-white/50 text-xs mb-1 flex items-center justify-center gap-1">
                <CheckCircle2 size={12} />
                Seu código de acesso:
              </p>
              <button
                onClick={copyAccessCode}
                className="flex items-center justify-center gap-2 mx-auto group"
              >
                <span className="text-2xl font-black text-white font-mono tracking-widest">
                  {data.accessCode}
                </span>
                {codeCopied ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} className="text-white/40 group-hover:text-white/80 transition" />
                )}
              </button>
              <p className="text-white/30 text-xs mt-2">
                Guarde este código! Use-o para acessar suas músicas por até 30 dias.
              </p>
            </div>
          )}

          {/* Letra da música (colapsável) */}
          {data.generatedLyrics && (
            <details className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
              <summary className="p-4 cursor-pointer text-white font-bold text-sm flex items-center gap-2 hover:bg-white/5 transition">
                <FileText size={16} className="text-violet-400" />
                Ver letra da música
              </summary>
              <div className="px-4 pb-4">
                <pre className="whitespace-pre-wrap text-white/70 text-sm leading-relaxed font-sans">
                  {data.generatedLyrics}
                </pre>
              </div>
            </details>
          )}

          {/* Voltar */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition"
            >
              <ArrowLeft size={14} />
              Voltar ao site
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
