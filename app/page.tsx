'use client';

import { SERVICES, TESTIMONIALS } from '@/lib/data';
import { Music, PlayCircle, Star, Heart, Clock, ArrowRight, Mic2, Volume2, Headphones, Award, Users, Sparkles, ChevronRight, ChevronDown, Phone, Mail, Instagram, Shield, Gift, Zap, Check, RefreshCw, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PortfolioSection from '@/components/PortfolioSection';
import CheckoutModal from '@/components/CheckoutModal';
import Planos from '@/components/Planos';
import PurchaseNotifications from '@/components/PurchaseNotifications';
import { useState, useEffect, useRef } from 'react';

// Componente de Logo Premium
const Logo = ({ white = false }: { white?: boolean }) => (
  <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
    <div className="relative flex items-center gap-[2px]">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-300 group-hover:scale-110 ${white ? 'bg-white' : 'bg-gradient-to-t from-violet-600 to-purple-500'}`}
          style={{
            height: `${[14, 24, 18, 32, 18, 24, 14][i]}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
    <div className="flex flex-col">
      <span className={`text-xl font-black leading-none tracking-tight ${white ? 'text-white' : 'text-gray-900'}`}>
        Cantos de Memórias
      </span>
      <span className={`text-[10px] uppercase tracking-[0.2em] mt-1 font-medium ${white ? 'text-violet-200' : 'text-violet-600'}`}>
        Músicas Personalizadas
      </span>
    </div>
  </Link>
);

// Componente de Visualizador de Música (otimizado: alturas fixas, sem Math.random, 8 barras)
const BAR_HEIGHTS = [45, 75, 55, 90, 40, 70, 60, 80];

const MusicVisualizer = () => (
  <div className="flex items-end gap-1 h-12">
    {BAR_HEIGHTS.map((h, i) => (
      <div
        key={i}
        className="music-bar will-change-transform"
        style={{
          height: `${h}%`,
          minHeight: '20%',
        }}
      />
    ))}
  </div>
);

// Seção de Vídeos Reais de Clientes
const ClientVideosSection = ({ onOpenModal }: { onOpenModal: () => void }) => {
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const videos = [
    {
      id: 1,
      src: '/videos/cliente-reacao-3.mp4',
      title: 'Emoção pura',
      desc: 'O coração batendo no ritmo da música',
    },
    {
      id: 2,
      src: '/videos/cliente-reacao-4.mp4',
      title: 'Momento inesquecível',
      desc: 'Trilha sonora para um momento especial',
    },
    {
      id: 3,
      src: '/videos/cliente-reacao-1.mp4',
      title: 'Surpresa incrível',
      desc: 'A reação que não tem preço',
    },
    {
      id: 4,
      src: '/videos/cliente-reacao-2.mp4',
      title: 'Memórias que tocam',
      desc: 'Criamos memórias que tocam o coração',
    },
  ];

  const handlePlay = (id: number, idx: number) => {
    // Pausar vídeo anterior se existir
    if (playingVideo !== null && playingVideo !== id) {
      const prevIdx = videos.findIndex(v => v.id === playingVideo);
      if (prevIdx >= 0 && videoRefs.current[prevIdx]) {
        videoRefs.current[prevIdx]!.pause();
      }
    }

    const video = videoRefs.current[idx];
    if (!video) return;

    if (playingVideo === id && !video.paused) {
      video.pause();
      setPlayingVideo(null);
    } else {
      video.play().catch(() => {});
      setPlayingVideo(id);
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-white to-violet-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-100 border border-pink-200 px-4 py-2 rounded-full mb-4">
            <Heart className="text-pink-600 fill-pink-600" size={16} />
            <span className="text-pink-700 font-semibold text-sm">Clientes Reais</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Veja a <span className="text-gradient-royal">emoção</span> de quem recebeu
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
            Vídeos reais dos nossos clientes recebendo suas músicas personalizadas
          </p>
        </div>

        {/* Grid de vídeos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {videos.map((video, idx) => (
            <div
              key={video.id}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-xl group cursor-pointer bg-black"
              onClick={() => handlePlay(video.id, idx)}
            >
              <video
                ref={(el) => { videoRefs.current[idx] = el; }}
                src={video.src}
                className="w-full h-full object-cover"
                playsInline
                preload="metadata"
                loop
                onEnded={() => setPlayingVideo(null)}
              />

              {/* Overlay - esconde quando tocando */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                playingVideo === video.id ? 'opacity-0' : 'opacity-100'
              }`}>
                {/* Gradiente inferior */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/50 group-hover:scale-110 transition-all">
                    <Play className="text-white w-6 h-6 sm:w-8 sm:h-8 ml-1" fill="white" />
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold">REAL</span>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <p className="text-white font-bold text-sm sm:text-base leading-tight">{video.title}</p>
                  <p className="text-white/70 text-xs mt-0.5">{video.desc}</p>
                </div>
              </div>

              {/* Botão pausar (aparece quando tocando) */}
              {playingVideo === video.id && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info + CTA */}
        <div className="text-center mt-8 sm:mt-10">
          <p className="text-gray-500 text-sm mb-4">
            <span className="font-semibold text-violet-600">+8.530 músicas</span> criadas • Dezenas de reações emocionantes
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-premium text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4"
            >
              <Sparkles size={18} />
              <span>Quero emocionar alguém</span>
            </button>
            <a
              href="https://www.instagram.com/cantosdememorias"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:scale-105 transition-transform"
            >
              <Instagram size={18} />
              <span>Mais no Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Contador animado de músicas criadas
const useAnimatedCounter = (start: number, end: number, intervalMs: number) => {
  const [count, setCount] = useState(start);
  useEffect(() => {
    if (count >= end) return;
    const timer = setInterval(() => {
      setCount(prev => prev < end ? prev + 1 : prev);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [count, end, intervalMs]);
  return count;
};

const formatNumber = (n: number) => n.toLocaleString('pt-BR');

// Notas musicais para as partículas flutuantes
const MUSIC_NOTES = ['♪', '♫', '♩', '♬', '𝄞', '𝄢'];

// Componente de Notas Musicais Flutuantes (otimizado: 6 partículas fixas, sem Math.random no render)
const PARTICLE_POSITIONS = [
  { left: '10%', top: '15%', delay: '0s', dur: '10s', size: '18px' },
  { left: '85%', top: '25%', delay: '2s', dur: '12s', size: '22px' },
  { left: '25%', top: '70%', delay: '1s', dur: '11s', size: '16px' },
  { left: '70%', top: '60%', delay: '3s', dur: '9s', size: '20px' },
  { left: '50%', top: '40%', delay: '4s', dur: '13s', size: '24px' },
  { left: '90%', top: '80%', delay: '5s', dur: '10s', size: '17px' },
];

const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {PARTICLE_POSITIONS.map((p, i) => (
      <div
        key={i}
        className="absolute text-violet-400/20 animate-particle select-none will-change-transform"
        style={{
          left: p.left,
          top: p.top,
          animationDelay: p.delay,
          animationDuration: p.dur,
          fontSize: p.size,
        }}
      >
        {MUSIC_NOTES[i % MUSIC_NOTES.length]}
      </div>
    ))}
  </div>
);

// Componente FAQ com Acordeão - Otimizado Mobile
const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => (
  <div className={`faq-item ${isOpen ? 'active' : ''}`}>
    <button
      onClick={onClick}
      className="w-full p-4 sm:p-6 flex items-center justify-between text-left"
    >
      <h3 className="text-sm sm:text-base font-bold text-gray-900 pr-3">{question}</h3>
      <ChevronDown
        className={`flex-shrink-0 text-violet-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        size={20}
      />
    </button>
    <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-96 pb-4 sm:pb-6' : 'max-h-0'}`}>
      <p className="px-4 sm:px-6 text-gray-600 text-sm sm:text-base leading-relaxed">{answer}</p>
    </div>
  </div>
);

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  // mousePosition removido — não é usado no JSX e causava re-render a cada pixel
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'premium'>('basico');
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicCount = useAnimatedCounter(8530, 8535, 45000);

  // Pegar o serviço de música personalizada
  const musicService = SERVICES.find(s => s.slug === 'musica-personalizada') || SERVICES[0];

  // Música de exemplo do Hero
  const heroAudioSrc = "/audio/exemplo.mp3";

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Carregar áudio sob demanda na primeira vez
        if (audioRef.current.preload === 'none') {
          audioRef.current.preload = 'auto';
          audioRef.current.load();
        }
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const faqData = [
    {
      question: "Como funciona a criação de uma música personalizada?",
      answer: "O processo é simples e rápido: 1) Você preenche um formulário contando a história e detalhes da pessoa homenageada; 2) Nosso sistema gera uma letra personalizada que você pode aprovar ou editar; 3) Escolha entre 1 música ou 3 músicas; 4) Após o pagamento, sua música é gerada automaticamente em poucos minutos!"
    },
    {
      question: "Quanto custa uma música personalizada?",
      answer: "Temos dois planos: 1 Música Personalizada por R$39,90 e 3 Músicas Personalizadas por R$79,90. Em ambos você aprova a letra antes de pagar e a entrega é automática em poucos minutos!"
    },
    {
      question: "Qual a diferença entre os planos?",
      answer: "No plano de 1 música (R$39,90) você recebe 1 música personalizada com 2 melodias exclusivas. No plano de 3 músicas (R$79,90) você recebe 3 músicas com 2 melodias cada, suporte prioritário. Preços exclusivos do site!"
    },
    {
      question: "Em quanto tempo recebo minha música?",
      answer: "A entrega é automática! Após a confirmação do pagamento, sua música é gerada por inteligência artificial em poucos minutos. Você recebe o link por e-mail e pode ouvir e baixar na hora."
    },
    {
      question: "Posso ver a letra antes de pagar?",
      answer: "Sim! Você vê e aprova a letra gerada antes de fazer o pagamento. Pode solicitar ajustes até ficar satisfeito(a) com o resultado. Só paga depois de aprovar!"
    },
    {
      question: "Para quais ocasiões posso encomendar uma música?",
      answer: "Você pode encomendar músicas para qualquer ocasião especial: aniversários, casamentos, Dia das Mães, Dia dos Pais, Dia dos Namorados, chá revelação, homenagens póstumas, formaturas, bodas, mesversários e muito mais."
    },
    {
      question: "Posso usar a música em redes sociais?",
      answer: "Sim! A música é 100% sua e você pode usar onde quiser: Instagram, TikTok, YouTube, WhatsApp, em festas, eventos, ou qualquer lugar. Você recebe os arquivos em alta qualidade para compartilhar como preferir."
    }
  ];

  return (
    <main className="relative bg-white overflow-x-hidden">
      {/* ================================================================
          HEADER / NAVBAR PREMIUM
          ================================================================ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/5 py-3'
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Logo white={!isScrolled} />

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {['Serviços', 'Portfólio', 'Como Funciona', 'Depoimentos', 'Dúvidas'].map((item, i) => (
                <a
                  key={i}
                  href={`#${item.toLowerCase().replace(' ', '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
                  className={`text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                    isScrolled
                      ? 'text-gray-700 hover:text-violet-600'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/acesso"
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-xs transition-all duration-300 hover:scale-105 ${
                  isScrolled
                    ? 'text-violet-600 hover:bg-violet-50'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Music size={14} />
                <span>Minha Música</span>
              </Link>
              <Link
                href="#planos"
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  isScrolled
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-violet-500/25'
                    : 'bg-white text-violet-600 shadow-white/25'
                }`}
              >
                <Sparkles size={16} />
                <span>Criar Música</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================
          HERO SECTION - DESIGN LEVE EM CÓDIGO (SEM IMAGEM PESADA)
          ================================================================ */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#0d0620] via-[#1a0f3a] to-[#0f0a1e] min-h-[100svh] flex items-center">
        {/* Audio Element Hidden */}
        <audio
          ref={audioRef}
          src={heroAudioSrc}
          preload="none"
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Partículas de notas musicais flutuantes */}
        <FloatingParticles />

        {/* Efeitos de glow decorativos */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-80 sm:h-80 bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Conteúdo principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-20 w-full">

          {/* ── MOBILE: layout empilhado otimizado ── */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">

            {/* ═══ Lado esquerdo — Texto ═══ */}
            <div className="text-center lg:text-left order-2 lg:order-1">

              {/* Pill social proof */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6 animate-fadeInUp">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-xs sm:text-sm font-medium">+{formatNumber(musicCount)} músicas criadas com amor</span>
              </div>

              {/* Headline */}
              <h1 className="text-[1.7rem] leading-[1.15] sm:text-4xl md:text-5xl lg:text-[3.4rem] font-black text-white mb-3 sm:mb-5 lg:mb-6 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                Transforme Sentimentos em{' '}
                <br className="hidden sm:block" />
                uma{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
                  Música Única
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  Pronta em 5 Minutos
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-300/90 text-sm sm:text-base lg:text-lg mb-5 sm:mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                Uma música personalizada com a história de quem você ama. Letra feita por IA, melodia profissional — entregue automaticamente no seu e-mail.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <a
                  href="#planos"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300"
                >
                  <Sparkles size={18} />
                  <span>Criar Minha Música</span>
                  <ArrowRight size={16} />
                </a>
                <a
                  href="#portfolio"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:bg-white/20 transition-all duration-300"
                >
                  <Headphones size={18} />
                  <span>Ouvir Exemplos</span>
                </a>
              </div>

              {/* Stats — desktop only (mobile stats moved near player) */}
              <div className="hidden lg:flex items-center gap-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                {[
                  { value: `${formatNumber(musicCount)}+`, label: 'Músicas Criadas' },
                  { value: '4.9★', label: 'Avaliação' },
                  { value: '~5min', label: 'Entrega' },
                ].map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <p className="text-white font-black text-xl">{stat.value}</p>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ Lado direito — Player card ═══ */}
            <div className="flex justify-center lg:justify-end animate-fadeInUp order-1 lg:order-2" style={{ animationDelay: '0.2s' }}>
              <div className="relative w-full max-w-[320px] sm:max-w-sm">

                {/* Card do player */}
                <div className="bg-[#1a1333]/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-purple-500/10">

                  {/* Imagem da música */}
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-xl shadow-violet-500/20">
                      <Image
                        src="/images/hero-player.png"
                        alt="Parabéns Nicolas - Exemplo de música de aniversário"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                  </div>

                  {/* Título da música */}
                  <div className="text-center mb-4 sm:mb-6">
                    <p className="text-white font-bold text-base sm:text-lg">Parabéns Nicolas</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Exemplo de música de aniversário</p>
                  </div>

                  {/* Visualizador de música */}
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <MusicVisualizer />
                  </div>

                  {/* Barra de progresso */}
                  <div className="mb-3 sm:mb-4">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                      <span className="text-xs text-gray-500">{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Botão Play */}
                  <button
                    onClick={togglePlay}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:from-violet-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-violet-500/20 text-sm sm:text-base"
                  >
                    {isPlaying ? (
                      <>
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle size={20} />
                        <span>Ouvir Exemplo</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Badge flutuante — preço */}
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg shadow-green-500/40 animate-pulse flex items-center gap-1 sm:gap-1.5 z-10">
                  <span className="text-[10px] sm:text-xs text-green-100">A partir de</span>
                  <span className="text-sm sm:text-base font-black text-white">R$39,90</span>
                </div>

                {/* Banner "Entrega em 5 minutos" — abaixo do player */}
                <div className="mt-3 sm:mt-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur border border-amber-500/40 rounded-2xl px-4 py-3 sm:py-3.5 flex items-center justify-center gap-2.5 shadow-lg">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-md shadow-orange-500/30 flex-shrink-0">
                    <Zap className="text-white" size={16} />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-extrabold text-sm sm:text-base leading-tight">Entrega em 5 minutos</p>
                    <p className="text-amber-200/80 text-[10px] sm:text-xs leading-tight">100% automático, direto no seu e-mail</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats — mobile only (abaixo de tudo) */}
          <div className="flex lg:hidden items-center justify-center gap-6 mt-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            {[
              { value: `${formatNumber(musicCount)}+`, label: 'Músicas' },
              { value: '4.9★', label: 'Avaliação' },
              { value: '~5min', label: 'Entrega' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-white font-black text-lg">{stat.value}</p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Onda decorativa na base */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V30C360 0 720 0 1080 30C1260 45 1380 55 1440 60V60H0Z" fill="#0f0a1e" />
          </svg>
        </div>
      </section>

      {/* ================================================================
          VÍDEOS REAIS DE CLIENTES
          ================================================================ */}
      <ClientVideosSection onOpenModal={() => setIsModalOpen(true)} />

      {/* ================================================================
          PLANOS - SEÇÃO ESCURA COM DESIGN ROXO/LARANJA
          ================================================================ */}
      <Planos onSelectPlan={(plan) => { setSelectedPlan(plan); setIsModalOpen(true); }} />

      {/* ================================================================
          COMO FUNCIONA - OTIMIZADO MOBILE
          ================================================================ */}
      <section id="como-funciona" className="py-10 sm:py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-[#0f0a1e] via-[#1a1333] to-[#0f0a1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-14">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
              <Zap className="text-violet-400" size={14} />
              <span className="text-violet-300 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Super Simples
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-3 sm:mb-4">
              Como <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">Funciona</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-lg">
              3 passos simples para emocionar quem você ama
            </p>
          </div>

          {/* Steps - Design Premium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto mb-8 sm:mb-12">
            {[
              { step: 1, icon: <Heart className="fill-current" size={22} />, title: 'Conte sua história', desc: 'Preencha o formulário com os detalhes da pessoa homenageada', color: 'from-pink-500 to-rose-600' },
              { step: 2, icon: <Sparkles size={22} />, title: 'Aprove a letra', desc: 'Veja e aprove a letra personalizada antes de pagar', color: 'from-violet-500 to-purple-600' },
              { step: 3, icon: <Music size={22} />, title: 'Receba no WhatsApp', desc: 'Sua música exclusiva é entregue diretamente no seu WhatsApp', color: 'from-amber-500 to-orange-600' }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-[#1a1333]/80 backdrop-blur border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center transition-all duration-300 hover:border-purple-500/40">
                  <div className="relative mx-auto mb-4 sm:mb-6">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${item.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto`}>
                      {item.icon}
                    </div>
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-xs sm:text-sm font-black text-gray-900 shadow-lg">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm lg:text-base leading-relaxed">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="text-purple-500/50" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Info de Entrega */}
          <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto mb-6 sm:mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-center sm:text-left">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Clock className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm sm:text-base">Plano Básico</p>
                  <p className="text-purple-300 text-xs sm:text-sm">Entrega em até 48 horas</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-12 bg-purple-500/30" />
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Zap className="text-orange-400" size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm sm:text-base">Plano Premium</p>
                  <p className="text-orange-300 text-xs sm:text-sm">Entrega no mesmo dia</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="#planos"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
            >
              <Music size={18} />
              <span>Começar Agora</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================
          PORTFOLIO
          ================================================================ */}
      <section id="portfolio">
        <PortfolioSection />
      </section>

      {/* ================================================================
          DEPOIMENTOS - ESTILO ESCURO
          ================================================================ */}
      <section id="depoimentos" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-[#0f0a1e] via-[#1a1333] to-[#0f0a1e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-pink-500/20 border border-pink-500/30 px-4 py-2 rounded-full mb-6">
              <Heart className="text-pink-400 fill-pink-400" size={16} />
              <span className="text-pink-300 font-semibold text-sm uppercase tracking-wider">
                Depoimentos
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Histórias que <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Emocionam</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              O que nossos clientes dizem sobre suas músicas
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
              <div
                key={index}
                className="bg-[#1a1333]/80 backdrop-blur border border-purple-500/20 rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:border-purple-500/40"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-amber-400 fill-amber-400" size={16} />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-300 text-base mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-500/30"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-purple-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FAQ - ESTILO ESCURO
          ================================================================ */}
      <section id="faq" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-[#0f0a1e] via-[#1a1333] to-[#0f0a1e]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-full mb-6">
              <Sparkles className="text-amber-400" size={16} />
              <span className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
                Dúvidas
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Frequentes</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg">
              Respostas rápidas para suas dúvidas
            </p>
          </div>

          {/* FAQ Accordion - Estilo Escuro */}
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="bg-[#1a1333]/80 backdrop-blur border border-purple-500/20 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/40"
              >
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left"
                >
                  <h3 className="text-white font-bold text-sm sm:text-base pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`flex-shrink-0 text-purple-400 transition-transform duration-300 ${openFAQ === index ? 'rotate-180' : ''}`}
                    size={20}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-500 ${openFAQ === index ? 'max-h-96 pb-5 sm:pb-6' : 'max-h-0'}`}>
                  <p className="px-5 sm:px-6 text-gray-400 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-10 text-center">
            <a
              href="https://wa.me/5588992422920?text=Olá! Tenho uma dúvida sobre as músicas personalizadas."
              target="_blank"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold px-6 py-3 rounded-full hover:scale-105 transition-all duration-300"
            >
              <Phone size={18} />
              <span>Mais dúvidas? Fale conosco no WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA FINAL - OTIMIZADO MOBILE
          ================================================================ */}
      <section className="py-12 sm:py-20 lg:py-28 relative overflow-hidden bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 sm:mb-6">
            Pronto para criar uma
            <span className="block mt-1 text-gradient-royal">memória eterna?</span>
          </h2>

          <p className="text-sm sm:text-base text-white/60 mb-6 sm:mb-8 max-w-xl mx-auto">
            O presente mais emocionante que alguém pode receber.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#planos"
              className="w-full sm:w-auto flex items-center justify-center gap-2 btn-premium text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4"
            >
              <Music size={18} />
              <span>Criar Música</span>
            </a>
            <a
              href="https://wa.me/5588992422920"
              target="_blank"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER - OTIMIZADO MOBILE
          ================================================================ */}
      <footer className="bg-gray-900 text-white py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Versão simplificada no mobile */}
          <div className="text-center sm:text-left sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="mb-6 sm:mb-0">
              <div className="flex justify-center sm:justify-start">
                <Logo white />
              </div>
              <Link href="/acesso" className="inline-flex items-center gap-2 mt-4 mb-3 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-full text-sm font-bold transition sm:hidden">
                <Music size={16} />
                Acessar minha música
              </Link>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 sm:mt-4">
                {[
                  { icon: <Instagram size={18} />, href: 'https://www.instagram.com/cantosdememorias' },
                  { icon: <Phone size={18} />, href: 'https://wa.me/5588992422920' },
                  { icon: <Mail size={18} />, href: 'mailto:contato@cantosdememoria.com' },
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/70 hover:bg-violet-600 hover:text-white transition-colors"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact - Hidden on very small screens */}
            <div className="hidden sm:block">
              <h4 className="font-bold text-sm mb-4 text-violet-400">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://wa.me/5588992422920" target="_blank" className="text-gray-400 hover:text-white">
                    (88) 99242-2920
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/cantosdememorias" target="_blank" className="text-gray-400 hover:text-white">
                    @cantosdememorias
                  </a>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div className="hidden sm:block lg:block">
              <h4 className="font-bold text-sm mb-4 text-violet-400">Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/acesso" className="text-gray-400 hover:text-white flex items-center gap-2">
                    <Music size={14} />
                    Acessar minha música
                  </Link>
                </li>
                {['Serviços', 'Portfólio', 'Depoimentos'].map((item, i) => (
                  <li key={i}>
                    <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              © 2024 Cantos de Memórias
            </p>
          </div>
        </div>
      </footer>

      {/* ================================================================
          BOTÃO WHATSAPP FLUTUANTE - OTIMIZADO MOBILE
          ================================================================ */}
      <a
        href="https://wa.me/5588992422920?text=Olá! Gostaria de saber mais sobre as músicas personalizadas."
        target="_blank"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
        aria-label="Falar no WhatsApp"
      >
        <div className="relative bg-green-500 hover:bg-green-600 text-white p-3 sm:p-4 rounded-full shadow-xl shadow-green-500/30 transition-all duration-300 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
      </a>

      {/* Modal de Checkout */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={musicService}
        selectedPlan={selectedPlan}
      />

      {/* Notificações de compra (social proof) */}
      <PurchaseNotifications />
    </main>
  );
}
