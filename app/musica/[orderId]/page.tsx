'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Music, Download, FileText, Play, Pause, ArrowLeft, Clock, CheckCircle2, AlertCircle, Loader2, Copy, Check, Plus, Sparkles, RefreshCw, Edit3, Mic2, MessageCircle, Mail } from 'lucide-react';
import Link from 'next/link';

const MUSIC_STYLES = [
  { value: 'romantico', label: 'Romântico', emoji: '💕' },
  { value: 'sertanejo', label: 'Sertanejo', emoji: '🤠' },
  { value: 'mpb', label: 'MPB', emoji: '🎸' },
  { value: 'pop', label: 'Pop', emoji: '🎤' },
  { value: 'gospel', label: 'Gospel', emoji: '🙏' },
  { value: 'forro', label: 'Forró', emoji: '🪗' },
  { value: 'pagode', label: 'Pagode', emoji: '🥁' },
  { value: 'samba', label: 'Samba', emoji: '💃' },
  { value: 'rock', label: 'Rock', emoji: '🎸' },
  { value: 'bossa-nova', label: 'Bossa Nova', emoji: '🎹' },
  { value: 'reggae', label: 'Reggae', emoji: '🌴' },
  { value: 'infantil', label: 'Infantil', emoji: '🧸' },
  { value: 'classico', label: 'Clássico', emoji: '🎻' },
  { value: 'funk-melody', label: 'Funk Melody', emoji: '🎧' },
  { value: 'eletronico', label: 'Eletrônico', emoji: '🎹' },
];

interface SongRecord {
  id: number;
  lyrics: string;
  musicStyle: string;
  musicStyleLabel: string;
  honoreeName: string;
  occasion: string;
  status: 'generating' | 'completed' | 'failed';
  audioUrl?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

interface SunoTask {
  taskId: string;
  songId: number;
  style: string;
  styleLabel: string;
  status: string;
  audioUrls: string[];
}

interface MusicData {
  orderId: string;
  musicStatus: string;
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
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
  songs: SongRecord[];
  sunoTasks: SunoTask[];
  upsellPurchased: boolean;
}

export default function MusicaPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [data, setData] = useState<MusicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Estado do formulário de nova música
  const [showNewSongForm, setShowNewSongForm] = useState(false);
  const [newSongStep, setNewSongStep] = useState<'story' | 'lyrics' | 'style'>('story');
  const [newStory, setNewStory] = useState('');
  const [newLyrics, setNewLyrics] = useState('');
  const [newStyle, setNewStyle] = useState('');
  const [newStyleLabel, setNewStyleLabel] = useState('');
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [creatingSong, setCreatingSong] = useState(false);
  const [formError, setFormError] = useState('');
  const [lyricsApproved, setLyricsApproved] = useState(false);

  // Estado do upsell
  const [showUpsellPix, setShowUpsellPix] = useState(false);
  const [upsellLoading, setUpsellLoading] = useState(false);
  const [upsellPixData, setUpsellPixData] = useState<{ qrCode: string; pixCopiaECola: string } | null>(null);
  const [upsellPixCopied, setUpsellPixCopied] = useState(false);
  const [upsellPaid, setUpsellPaid] = useState(false);

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

  useEffect(() => { fetchStatus(); }, [orderId]);

  // Polling enquanto está gerando
  useEffect(() => {
    if (data?.musicStatus === 'generating' || data?.musicStatus === 'pending') {
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
    // Também poll se alguma song está gerando
    if (data?.songs?.some(s => s.status === 'generating')) {
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [data?.musicStatus, data?.songs]);

  // Proxy URL para reproduzir áudio sem problemas de CORS
  const getStreamUrl = (url: string, download = false) => {
    if (!url) return '';
    // Se já é URL local, não precisa de proxy
    if (url.startsWith('/')) return url;
    const base = `/api/music/stream?url=${encodeURIComponent(url)}`;
    return download ? `${base}&dl=1` : base;
  };

  // Retorna todas as audioUrls de um song (via sunoTasks ou fallback para song.audioUrl)
  const getMelodiesForSong = (song: SongRecord): string[] => {
    if (!data) return song.audioUrl ? [song.audioUrl] : [];
    const task = (data.sunoTasks || []).find(t => t.songId === song.id);
    if (task && task.audioUrls && task.audioUrls.length > 0) {
      return task.audioUrls;
    }
    return song.audioUrl ? [song.audioUrl] : [];
  };

  const playMelody = (key: string, audioUrl: string) => {
    setAudioError(null);

    if (playingKey === key && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(err => {
          console.error('Erro ao reproduzir:', err);
          setAudioError('Não foi possível reproduzir. Tente baixar o MP3.');
        });
      } else {
        audioRef.current.pause();
      }
      return;
    }

    setPlayingKey(key);
    setCurrentTime(0);
    setDuration(0);

    // Usar proxy para evitar problemas de CORS e Content-Disposition
    const streamUrl = getStreamUrl(audioUrl);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = streamUrl;
      audioRef.current.load();

      const onCanPlay = () => {
        audioRef.current?.play().catch(err => {
          console.error('Erro ao reproduzir:', err);
          setAudioError('Não foi possível reproduzir. Tente baixar o MP3.');
        });
        audioRef.current?.removeEventListener('canplay', onCanPlay);
      };

      audioRef.current.addEventListener('canplay', onCanPlay);
    }
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

  // Criar upsell PIX
  const startUpsell = async () => {
    setUpsellLoading(true);
    try {
      const res = await fetch('/api/upsell/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || 'Erro ao criar pagamento');
        setUpsellLoading(false);
        return;
      }
      setUpsellPixData({
        qrCode: result.pixData.qrCode,
        pixCopiaECola: result.pixData.pixCopiaECola,
      });
      setShowUpsellPix(true);
      setUpsellLoading(false);

      // Polling para verificar se o upsell foi pago (checa se creditsTotal aumentou)
      const initialCredits = data?.creditsTotal || 0;
      const pollUpsell = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/music/status/${orderId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.creditsTotal > initialCredits) {
              clearInterval(pollUpsell);
              setUpsellPaid(true);
              setShowUpsellPix(false);
              setData(statusData);
            }
          }
        } catch {}
      }, 5000);

      // Parar polling após 10 minutos
      setTimeout(() => clearInterval(pollUpsell), 600000);
    } catch {
      setFormError('Erro ao processar. Tente novamente.');
      setUpsellLoading(false);
    }
  };

  const copyUpsellPix = () => {
    if (upsellPixData?.pixCopiaECola) {
      navigator.clipboard.writeText(upsellPixData.pixCopiaECola);
      setUpsellPixCopied(true);
      setTimeout(() => setUpsellPixCopied(false), 2000);
    }
  };

  const shareWhatsApp = (song?: SongRecord) => {
    if (!data) return;
    const name = song?.honoreeName || data.honoreeName;
    const text = `🎵 Olha a música que eu fiz para ${name}! Ouve aqui: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareEmail = (song?: SongRecord) => {
    if (!data) return;
    const name = song?.honoreeName || data.honoreeName;
    const subject = `🎵 Uma música especial para ${name}`;
    const body = `Olha que lindo! Eu criei uma música personalizada para ${name}!\n\nOuça aqui: ${window.location.href}\n\nFeito com amor no Cantos de Memórias ❤️`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const downloadLyrics = (lyrics: string, name: string) => {
    const blob = new Blob([lyrics], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `letra-${name || 'musica'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Gerar letra para nova música
  const generateNewLyrics = async () => {
    if (!data || newStory.trim().length < 20) return;
    setGeneratingLyrics(true);
    setFormError('');
    try {
      const res = await fetch('/api/generate-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship: '',
          relationshipLabel: '',
          honoreeName: data.honoreeName,
          occasion: data.occasion,
          occasionLabel: data.occasion,
          musicStyle: newStyle || data.musicStyle || 'pop',
          musicStyleLabel: newStyleLabel || data.musicStyle,
          voicePreference: 'sem_preferencia',
          qualities: newStory,
          memories: newStory,
          heartMessage: newStory,
          familyNames: '',
        }),
      });
      const result = await res.json();
      if (result.error) {
        setFormError(result.error);
      } else if (result.lyrics) {
        setNewLyrics(result.lyrics);
        setLyricsApproved(false);
        setNewSongStep('lyrics');
      }
    } catch {
      setFormError('Erro ao gerar letra. Tente novamente.');
    } finally {
      setGeneratingLyrics(false);
    }
  };

  // Criar música com crédito
  const createNewSong = async () => {
    if (!newLyrics.trim() || !newStyle) return;
    setCreatingSong(true);
    setFormError('');
    try {
      const res = await fetch('/api/music/create-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          lyrics: newLyrics,
          musicStyle: newStyle,
          musicStyleLabel: newStyleLabel,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || 'Erro ao criar música');
      } else {
        // Sucesso! Resetar form e recarregar
        setShowNewSongForm(false);
        setNewSongStep('story');
        setNewStory('');
        setNewLyrics('');
        setNewStyle('');
        setLyricsApproved(false);
        fetchStatus();
      }
    } catch {
      setFormError('Erro ao criar música. Tente novamente.');
    } finally {
      setCreatingSong(false);
    }
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
          <Link href="/acesso" className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-full font-bold hover:bg-violet-500 transition">
            <ArrowLeft size={16} /> Tentar com código
          </Link>
        </div>
      </div>
    );
  }

  // Nenhuma música pronta ainda e está gerando
  const isGenerating = data.musicStatus === 'generating' || data.musicStatus === 'pending' || data.songs?.some(s => s.status === 'generating');
  const completedSongs = (data.songs || []).filter(s => s.status === 'completed');
  const hasNoSongsYet = completedSongs.length === 0;

  if (hasNoSongsYet && isGenerating) {
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
            A música de <strong className="text-violet-300">{data.honoreeName}</strong> está sendo gerada.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 text-violet-300 mb-3">
              <Clock size={16} />
              <span className="text-sm font-medium">Tempo estimado: 2-3 minutos</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-white/40 mt-2">Esta página atualiza automaticamente</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PORTAL DO CLIENTE
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0620] via-[#1a0f3a] to-[#0f0a1e]">
      {/* Audio Element - sem crossOrigin para evitar bloqueio CORS */}
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setPlayingKey(null)}
        onError={() => {
          console.error('Audio error - URL:', audioRef.current?.src);
          setAudioError('Não foi possível reproduzir. Tente baixar o MP3.');
        }}
      />

      {/* Header */}
      <header className="px-4 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/60 hover:text-white transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Minhas Músicas</h1>
              <p className="text-white/50 text-sm">{data.customerName}</p>
            </div>
          </div>
          {/* Badge de créditos */}
          {data.creditsTotal > 1 && (
            <div className="bg-violet-500/20 border border-violet-500/30 rounded-full px-4 py-2 text-center">
              <p className="text-violet-300 text-xs font-bold">{data.creditsRemaining} de {data.creditsTotal}</p>
              <p className="text-violet-400/60 text-[10px]">créditos</p>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 pb-10">
        <div className="max-w-2xl mx-auto">

          {/* Lista de músicas */}
          {completedSongs.length > 0 && (
            <div className="space-y-4 mb-6">
              {completedSongs.map((song) => {
                const melodies = getMelodiesForSong(song);
                return (
                <div key={song.id} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
                  {/* Header da música */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-violet-500/20 text-violet-300 text-xs font-bold px-2 py-0.5 rounded-full">
                        Música {song.id}
                      </span>
                      <span className="text-white/40 text-xs">{song.musicStyleLabel}</span>
                      {melodies.length > 1 && (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {melodies.length} melodias
                        </span>
                      )}
                      <CheckCircle2 className="w-4 h-4 text-green-400 ml-auto" />
                    </div>

                    {/* Melodias */}
                    {melodies.length > 0 && (
                      <div className="space-y-3">
                        {melodies.map((url, melIdx) => {
                          const melKey = `song-${song.id}-mel-${melIdx}`;
                          const isPlaying = playingKey === melKey && audioRef.current && !audioRef.current.paused;
                          return (
                            <div key={melKey} className={`rounded-xl p-3 transition ${playingKey === melKey ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-white/[0.02]'}`}>
                              <div className="flex items-center gap-3 mb-2">
                                <button
                                  onClick={() => playMelody(melKey, url)}
                                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition flex-shrink-0 ${melIdx === 0 ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-violet-500/30' : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30'}`}
                                >
                                  {isPlaying
                                    ? <Pause size={16} className="text-white" />
                                    : <Play size={16} className="text-white ml-0.5" />}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-bold text-sm truncate">
                                    {melodies.length > 1 ? `Melodia ${melIdx + 1}` : `Música para ${song.honoreeName}`}
                                  </p>
                                  <p className="text-white/50 text-xs">{song.musicStyleLabel}{melodies.length > 1 && melIdx === 0 ? ' - Original' : melodies.length > 1 ? ' - Variação' : ''}</p>
                                </div>
                                <a
                                  href={getStreamUrl(url, true)}
                                  download={`musica-${song.honoreeName}-${song.id}${melodies.length > 1 ? `-melodia${melIdx + 1}` : ''}.mp3`}
                                  className="flex items-center justify-center gap-1 bg-white/5 border border-white/20 text-white py-1.5 px-2.5 rounded-lg text-[10px] hover:bg-white/10 transition flex-shrink-0"
                                >
                                  <Download size={12} /> MP3
                                </a>
                              </div>

                              {/* Progress bar */}
                              {playingKey === melKey && (
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
                                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-200" style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }} />
                                  </div>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-xs text-white/40">{formatTime(currentTime)}</span>
                                    <span className="text-xs text-white/40">{formatTime(duration)}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Erro de reprodução */}
                    {audioError && playingKey?.startsWith(`song-${song.id}`) && (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-2">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-xs">{audioError}</p>
                      </div>
                    )}

                    {/* Letra da música */}
                    {song.lyrics && (
                      <div className="mt-4 bg-white/[0.03] border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-violet-400" />
                            <span className="text-white/70 text-xs font-bold">Letra da Música {song.id}</span>
                          </div>
                          <button
                            onClick={() => downloadLyrics(song.lyrics, song.honoreeName)}
                            className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-[10px] font-medium transition"
                          >
                            <Download size={10} /> Baixar .txt
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap text-white/60 text-sm leading-relaxed font-sans max-h-[300px] overflow-y-auto">{song.lyrics}</pre>
                      </div>
                    )}

                    {/* Botões de compartilhamento */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => shareWhatsApp(song)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600/20 border border-green-500/30 text-green-300 py-2.5 rounded-xl text-xs font-medium hover:bg-green-600/30 transition"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </button>
                      <button
                        onClick={() => shareEmail(song)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-300 py-2.5 rounded-xl text-xs font-medium hover:bg-blue-600/30 transition"
                      >
                        <Mail size={14} /> E-mail
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* Música em geração */}
          {data.songs?.filter(s => s.status === 'generating').map(song => (
            <div key={song.id} className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin flex-shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">Criando música {song.id}...</p>
                  <p className="text-violet-300 text-xs">{song.musicStyleLabel} - Aguarde 2-3 minutos</p>
                </div>
              </div>
              <div className="mt-3 w-full h-1.5 bg-violet-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full animate-pulse" style={{ width: '50%' }} />
              </div>
            </div>
          ))}

          {/* Botão criar nova música (se tem créditos) */}
          {data.creditsRemaining > 0 && !data.songs?.some(s => s.status === 'generating') && !showNewSongForm && (
            <button
              onClick={() => setShowNewSongForm(true)}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white py-4 rounded-2xl font-bold text-base transition shadow-lg shadow-amber-500/20 mb-6"
            >
              <Plus size={22} />
              Criar nova música ({data.creditsRemaining} crédito{data.creditsRemaining > 1 ? 's' : ''} restante{data.creditsRemaining > 1 ? 's' : ''})
            </button>
          )}

          {/* ==========================================
              FORMULÁRIO DE NOVA MÚSICA
              ========================================== */}
          {showNewSongForm && (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <h3 className="text-white font-bold">Criar nova música</h3>
                  </div>
                  <button onClick={() => { setShowNewSongForm(false); setNewSongStep('story'); setNewStory(''); setNewLyrics(''); setNewStyle(''); setFormError(''); }} className="text-white/40 hover:text-white text-sm">Cancelar</button>
                </div>
                {/* Passos */}
                <div className="flex gap-2 mt-3">
                  {['História', 'Letra', 'Estilo'].map((label, i) => {
                    const steps = ['story', 'lyrics', 'style'];
                    const isActive = steps.indexOf(newSongStep) >= i;
                    return (
                      <div key={label} className={`flex-1 h-1 rounded-full ${isActive ? 'bg-amber-400' : 'bg-white/10'}`} />
                    );
                  })}
                </div>
              </div>

              <div className="p-4">
                {formError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4">
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-xs">{formError}</p>
                  </div>
                )}

                {/* Passo 1: História */}
                {newSongStep === 'story' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/70 text-xs font-bold mb-2">
                        Conte a história para esta nova música
                      </label>
                      <p className="text-white/40 text-xs mb-2">
                        Pode ser para a mesma pessoa ou outra! Conte memórias, sentimentos, o que quiser expressar.
                      </p>
                      <textarea
                        value={newStory}
                        onChange={(e) => setNewStory(e.target.value)}
                        rows={4}
                        maxLength={1000}
                        className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500 resize-none"
                        placeholder="Ex: Quero uma música animada contando como nos conhecemos..."
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-white/30">Mínimo 20 caracteres</span>
                        <span className={`text-xs ${newStory.length < 20 ? 'text-red-400' : 'text-green-400'}`}>{newStory.length}/1000</span>
                      </div>
                    </div>

                    {/* Estilo musical */}
                    <div>
                      <label className="block text-white/70 text-xs font-bold mb-2">
                        <Mic2 size={12} className="inline mr-1" />
                        Estilo musical
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {MUSIC_STYLES.map(s => (
                          <button key={s.value} type="button"
                            onClick={() => { setNewStyle(s.value); setNewStyleLabel(s.label); }}
                            className={`p-2 rounded-lg border text-center transition ${newStyle === s.value ? 'border-amber-400 bg-amber-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                            <span className="text-sm block">{s.emoji}</span>
                            <span className={`text-[9px] font-medium block ${newStyle === s.value ? 'text-amber-300' : 'text-white/50'}`}>{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={generateNewLyrics}
                      disabled={newStory.trim().length < 20 || !newStyle || generatingLyrics}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-40 transition"
                    >
                      {generatingLyrics ? <><Loader2 size={16} className="animate-spin" /> Gerando letra...</> : <><Sparkles size={16} /> Gerar letra</>}
                    </button>
                  </div>
                )}

                {/* Passo 2: Aprovar letra */}
                {newSongStep === 'lyrics' && (
                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 max-h-[200px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-white/70 text-sm leading-relaxed font-sans">{newLyrics}</pre>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setNewSongStep('story'); setNewLyrics(''); setLyricsApproved(false); }} className="flex-1 flex items-center justify-center gap-1.5 border border-white/20 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-white/5 transition">
                        <RefreshCw size={14} /> Nova versão
                      </button>
                      <button onClick={() => { setLyricsApproved(true); setNewSongStep('style'); }} className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-green-400 transition">
                        <Check size={14} /> Aprovar letra
                      </button>
                    </div>
                    <details className="border border-white/10 rounded-xl overflow-hidden">
                      <summary className="px-3 py-2 text-xs text-white/50 cursor-pointer hover:bg-white/5 flex items-center gap-1">
                        <Edit3 size={12} /> Editar manualmente
                      </summary>
                      <textarea value={newLyrics} onChange={(e) => { setNewLyrics(e.target.value); setLyricsApproved(false); }} rows={8} className="w-full bg-transparent border-t border-white/10 px-3 py-2 text-white text-xs font-mono resize-none focus:outline-none" />
                    </details>
                  </div>
                )}

                {/* Passo 3: Confirmar e criar */}
                {newSongStep === 'style' && (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-white font-bold text-sm">Tudo pronto!</p>
                      <p className="text-white/50 text-xs mt-1">Estilo: <strong className="text-amber-300">{newStyleLabel}</strong></p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 max-h-[120px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-white/50 text-xs leading-relaxed font-sans">{newLyrics.substring(0, 200)}...</pre>
                    </div>
                    <button
                      onClick={createNewSong}
                      disabled={creatingSong}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-base disabled:opacity-50 transition shadow-lg"
                    >
                      {creatingSong ? <><Loader2 size={18} className="animate-spin" /> Criando...</> : <><Music size={18} /> Criar música (usa 1 crédito)</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Código de acesso */}
          {data.accessCode && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center mb-6">
              <p className="text-white/50 text-xs mb-1 flex items-center justify-center gap-1">
                <CheckCircle2 size={12} /> Seu código de acesso:
              </p>
              <button onClick={copyAccessCode} className="flex items-center justify-center gap-2 mx-auto group">
                <span className="text-2xl font-black text-white font-mono tracking-widest">{data.accessCode}</span>
                {codeCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-white/40 group-hover:text-white/80 transition" />}
              </button>
              <p className="text-white/30 text-xs mt-2">Use este código em cantosdememorias.com.br/acesso</p>
            </div>
          )}

          {/* ==========================================
              UPSELL — Compre +1 música por R$19,90
              ========================================== */}
          {data.creditsRemaining === 0 && data.musicStatus === 'completed' && !data.upsellPurchased && !upsellPaid && !showUpsellPix && (
            <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-2xl p-5 sm:p-6 mb-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Oferta especial</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Quer mais uma música?</h3>
                <p className="text-white/60 text-sm mb-4">
                  Adicione +1 música personalizada com 2 melodias por um preço exclusivo!
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-white/40 text-sm">Apenas</span>
                  <span className="text-3xl font-black text-amber-400">R$19</span>
                  <span className="text-lg text-amber-400">,90</span>
                  <span className="text-white/30 text-xs ml-2 line-through">R$39,90</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {['1 música personalizada extra', '2 melodias exclusivas', 'Mesma qualidade e entrega rápida'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-white/70 text-xs">
                      <CheckCircle2 size={14} className="text-amber-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={startUpsell}
                  disabled={upsellLoading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {upsellLoading
                    ? <><Loader2 size={16} className="animate-spin" /> Gerando PIX...</>
                    : <><Plus size={16} /> Comprar +1 Música por R$19,90</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* Upsell pago com sucesso */}
          {upsellPaid && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-white font-bold">Pagamento confirmado!</p>
              <p className="text-white/60 text-sm mt-1">Agora você tem +1 crédito para criar uma nova música.</p>
              <button
                onClick={() => { setUpsellPaid(false); setShowNewSongForm(true); }}
                className="mt-3 inline-flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-green-400 transition"
              >
                <Music size={16} /> Criar minha música agora
              </button>
            </div>
          )}

          {/* Modal PIX do Upsell */}
          {showUpsellPix && upsellPixData && (
            <div className="bg-white/5 border border-amber-500/30 rounded-2xl overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 text-center border-b border-white/10">
                <p className="text-white font-bold text-sm">Pague via PIX para adicionar +1 música</p>
                <p className="text-amber-300 text-2xl font-black mt-1">R$ 19,90</p>
              </div>
              <div className="p-5 text-center">
                {upsellPixData.qrCode && (
                  <div className="bg-white rounded-xl p-3 inline-block mb-4">
                    <img src={upsellPixData.qrCode} alt="QR Code PIX" className="w-48 h-48" />
                  </div>
                )}
                <p className="text-white/50 text-xs mb-3">Ou copie o código PIX:</p>
                <button
                  onClick={copyUpsellPix}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-bold text-sm transition"
                >
                  {upsellPixCopied
                    ? <><Check size={16} /> Copiado!</>
                    : <><Copy size={16} /> Copiar código PIX</>
                  }
                </button>
                <p className="text-white/30 text-xs mt-3">Aguardando pagamento... a página atualiza automaticamente</p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <Loader2 size={12} className="text-amber-400 animate-spin" />
                  <span className="text-amber-400/60 text-xs">Verificando pagamento...</span>
                </div>
                <button
                  onClick={() => { setShowUpsellPix(false); setUpsellPixData(null); }}
                  className="mt-4 text-white/40 hover:text-white text-xs transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Voltar */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition">
              <ArrowLeft size={14} /> Voltar ao site
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
