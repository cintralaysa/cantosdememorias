'use client';

import { SERVICES, TESTIMONIALS } from '@/lib/data';
import { Music, PlayCircle, Star, Heart, Clock, ArrowRight, Mic2, Volume2, Headphones, Award, Users, Sparkles, ChevronRight, ChevronDown, Phone, Mail, Instagram, Shield, Gift, Zap, Check, RefreshCw, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PortfolioSection from '@/components/PortfolioSection';
import CheckoutModal from '@/components/CheckoutModal';
import Planos from '@/components/Planos';
import CouponPopup from '@/components/CouponPopup';
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

// Componente de Visualizador de Música
const MusicVisualizer = () => (
  <div className="flex items-end gap-1 h-12">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="music-bar"
        style={{
          height: `${Math.random() * 100}%`,
          minHeight: '20%',
          animationDelay: `${i * 0.1}s`,
        }}
      />
    ))}
  </div>
);

// Seção de Reações - Cards com thumbnails reais dos vídeos do Instagram
const InstagramReelsSection = ({ onOpenModal }: { onOpenModal: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Dados dos vídeos de reação com URLs específicas e thumbnails
  // IMPORTANTE: Substitua as thumbnails pelas capas reais dos vídeos salvando em /public/reels/
  const reels = [
    {
      id: 1,
      url: 'https://www.instagram.com/reel/DDopleHp0YS/',
      thumbnail: '/portfolio/fotos/Gemini_Generated_Image_czgkh4czgkh4czgk.png',
      title: 'Mãe emocionada',
      desc: 'Presente de aniversário',
      likes: '2.4k',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      id: 2,
      url: 'https://www.instagram.com/reel/DDgU47IJu5P/',
      thumbnail: '/portfolio/fotos/Gemini_Generated_Image_bzavwlbzavwlbzav.png',
      title: 'Surpresa incrível',
      desc: 'Ela não esperava',
      likes: '3.1k',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      id: 3,
      url: 'https://www.instagram.com/reel/DDYqsW8pXEw/',
      thumbnail: '/portfolio/fotos/Gemini_Generated_Image_siy9uysiy9uysiy9.png',
      title: 'Dia especial',
      desc: 'Momento único',
      likes: '1.8k',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 4,
      url: 'https://www.instagram.com/reel/DDTGR2lJCiH/',
      thumbnail: '/portfolio/fotos/Gemini_Generated_Image_qm5isrqm5isrqm5i.png',
      title: 'Reação linda',
      desc: 'Emoção pura',
      likes: '4.2k',
      gradient: 'from-red-500 to-pink-600'
    },
    {
      id: 5,
      url: 'https://www.instagram.com/reel/DC5Y44wpsHv/',
      thumbnail: '/portfolio/fotos/Gemini_Generated_Image_dkfj25dkfj25dkfj.png',
      title: 'Homenagem',
      desc: 'Família emocionada',
      likes: '2.9k',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 6,
      url: 'https://www.instagram.com/reel/DCx3P3MJp9t/',
      thumbnail: '/portfolio/fotos/Gemini_Generated_Image_yx5imgyx5imgyx5i.png',
      title: 'Presente especial',
      desc: 'Chorou de alegria',
      likes: '1.5k',
      gradient: 'from-emerald-500 to-teal-600'
    },
  ];

  // Auto scroll a cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const nextIndex = (currentIndex + 1) % reels.length;
        const cardWidth = 200;
        scrollRef.current.scrollTo({
          left: nextIndex * cardWidth,
          behavior: 'smooth'
        });
        setCurrentIndex(nextIndex);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, reels.length]);

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-white to-violet-50/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-100 border border-pink-200 px-4 py-2 rounded-full mb-4">
            <Heart className="text-pink-600 fill-pink-600" size={16} />
            <span className="text-pink-700 font-semibold text-sm">Reações Reais</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-3">
            Veja a <span className="text-gradient-royal">emoção</span> de quem recebeu
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
            Clique em cada vídeo para assistir no Instagram
          </p>
        </div>

        {/* Carrossel de Cards */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
        >
          {reels.map((reel, idx) => (
            <a
              key={reel.id}
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-shrink-0 snap-center group relative w-[160px] sm:w-[200px] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                idx === currentIndex ? 'ring-4 ring-violet-400 ring-offset-2' : ''
              }`}
            >
              {/* Thumbnail do vídeo */}
              <Image
                src={reel.thumbnail}
                alt={reel.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 160px, 200px"
              />

              {/* Overlay escuro */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/50 group-hover:scale-110 transition-all">
                  <Play className="text-white w-6 h-6 sm:w-8 sm:h-8 ml-1" fill="white" />
                </div>
              </div>

              {/* Instagram badge */}
              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full p-1.5">
                <Instagram className="text-white w-4 h-4" />
              </div>

              {/* Reel indicator */}
              <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                <Play className="text-white w-3 h-3" fill="white" />
                <span className="text-white text-xs font-medium">Reel</span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                <p className="text-white font-bold text-sm sm:text-base leading-tight">{reel.title}</p>
                <p className="text-white/70 text-xs mt-0.5">{reel.desc}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Heart className="text-red-400 w-3 h-3" fill="#f87171" />
                  <span className="text-white/80 text-xs">{reel.likes}</span>
                </div>
              </div>
            </a>
          ))}

          {/* Card final - Ver mais */}
          <a
            href="https://www.instagram.com/cantosdememorias"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 snap-center group relative w-[160px] sm:w-[200px] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Instagram className="text-white w-8 h-8" />
              </div>
              <p className="text-white font-bold text-lg">Ver todos</p>
              <p className="text-white/80 text-sm mt-1">@cantosdememorias</p>
              <div className="mt-4 bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-bold group-hover:bg-gray-100 transition-colors">
                Abrir Instagram
              </div>
            </div>
          </a>
        </div>

        {/* Indicadores */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {reels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    left: idx * 200,
                    behavior: 'smooth'
                  });
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-violet-500' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Info + CTA */}
        <div className="text-center mt-8 sm:mt-10">
          <p className="text-gray-500 text-sm mb-4">
            <span className="font-semibold text-violet-600">+7.234 músicas</span> criadas • Dezenas de reações emocionantes
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
              <span>Ver vídeos no Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

// Notas musicais para as partículas flutuantes
const MUSIC_NOTES = ['♪', '♫', '♩', '♬', '𝄞', '𝄢'];

// Componente de Notas Musicais Flutuantes
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute text-violet-400/30 animate-particle select-none"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 6}s`,
          animationDuration: `${8 + Math.random() * 6}s`,
          fontSize: `${14 + Math.random() * 14}px`,
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'premium'>('basico');
  const [couponActive, setCouponActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Pegar o serviço de música personalizada
  const musicService = SERVICES.find(s => s.slug === 'musica-personalizada') || SERVICES[0];

  // Música de exemplo do Hero
  const heroAudioSrc = "https://cdn1.suno.ai/eb315faa-63eb-4fa3-885f-9dd2421027d0.mp3";

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
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
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Restaurar estado do cupom do localStorage
  useEffect(() => {
    if (localStorage.getItem('couponActive') === 'true') {
      setCouponActive(true);
    }
  }, []);

  const handleUseCoupon = () => {
    setCouponActive(true);
    localStorage.setItem('couponActive', 'true');
    document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqData = [
    {
      question: "Como funciona a criação de uma música personalizada?",
      answer: "O processo é simples e rápido: 1) Você preenche um formulário contando a história e detalhes da pessoa homenageada; 2) Nosso sistema gera uma letra personalizada que você pode aprovar ou editar; 3) Escolha entre o Plano Básico ou Premium; 4) Após o pagamento, entregamos sua música via WhatsApp."
    },
    {
      question: "Quanto custa uma música personalizada?",
      answer: "Temos dois planos: Plano Básico por R$59,90 (1 melodia, entrega em até 48h) - exclusivo pelo site! E Plano Premium por R$79,90 (2 melodias diferentes, entrega no mesmo dia). Em ambos você aprova a letra antes de pagar!"
    },
    {
      question: "Qual a diferença entre os planos?",
      answer: "No Plano Básico (R$59,90 - exclusivo site) você recebe 1 melodia exclusiva com entrega em até 48 horas. No Plano Premium (R$79,90) você recebe 2 melodias diferentes e a entrega é no mesmo dia, com prioridade na produção."
    },
    {
      question: "Em quanto tempo recebo minha música?",
      answer: "Depende do plano escolhido: Plano Básico tem entrega em até 48 horas, e o Plano Premium tem entrega no mesmo dia após a confirmação do pagamento. Você recebe as músicas diretamente no seu WhatsApp."
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

            {/* CTA Button */}
            <Link
              href="#planos"
              className={`hidden sm:flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg ${
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
      </header>

      {/* ================================================================
          HERO SECTION - DESIGN LEVE EM CÓDIGO (SEM IMAGEM PESADA)
          ================================================================ */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#0d0620] via-[#1a0f3a] to-[#0f0a1e] min-h-[90vh] sm:min-h-screen flex items-center">
        {/* Audio Element Hidden */}
        <audio
          ref={audioRef}
          src={heroAudioSrc}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Partículas de notas musicais flutuantes */}
        <FloatingParticles />

        {/* Efeitos de glow decorativos */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-80 sm:h-80 bg-purple-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Conteúdo principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-12 sm:pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Lado esquerdo - Texto */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full mb-6 animate-fadeInUp">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-xs sm:text-sm font-medium">+2.000 músicas criadas com amor</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                Transforme Sua{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
                  História
                </span>
                <br />
                em{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  Música
                </span>
              </h1>

              <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                Uma música exclusiva e personalizada para eternizar seus momentos mais especiais. O presente mais emocionante que alguém pode receber.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8 sm:mb-10 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <a
                  href="#planos"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300"
                >
                  <Sparkles size={18} />
                  <span>Criar Minha Música</span>
                  <ArrowRight size={16} />
                </a>
                <a
                  href="#portfolio"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:bg-white/20 transition-all duration-300"
                >
                  <Headphones size={18} />
                  <span>Ouvir Exemplos</span>
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                {[
                  { value: '2.000+', label: 'Músicas' },
                  { value: '4.9★', label: 'Avaliação' },
                  { value: '48h', label: 'Entrega' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-white font-black text-lg sm:text-xl">{stat.value}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lado direito - Player e visualização */}
            <div className="flex justify-center lg:justify-end animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="relative w-full max-w-sm">
                {/* Card do player */}
                <div className="bg-[#1a1333]/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-500/10">
                  {/* Imagem dos headphones */}
                  <div className="flex justify-center mb-6">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shadow-xl shadow-violet-500/20">
                      <Image
                        src="/images/headphones.png"
                        alt="Headphones - Melodia do Coração"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                  </div>

                  {/* Título da música */}
                  <div className="text-center mb-6">
                    <p className="text-white font-bold text-base sm:text-lg">Melodia do Coração</p>
                    <p className="text-gray-400 text-sm">Exemplo de música personalizada</p>
                  </div>

                  {/* Visualizador de música */}
                  <div className="flex justify-center mb-6">
                    <MusicVisualizer />
                  </div>

                  {/* Barra de progresso */}
                  <div className="mb-4">
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
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 sm:py-4 rounded-xl font-bold hover:from-violet-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-violet-500/20"
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

                {/* Badge flutuante */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/30 animate-bounce">
                  A partir de R$59,90
                </div>
              </div>
            </div>
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
          PLANOS - SEÇÃO ESCURA COM DESIGN ROXO/LARANJA
          ================================================================ */}
      <Planos onSelectPlan={(plan) => { setSelectedPlan(plan); setIsModalOpen(true); }} couponActive={couponActive} />

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
              href="https://wa.me/5585996811925?text=Olá! Tenho uma dúvida sobre as músicas personalizadas."
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
              href="https://wa.me/5585996811925"
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
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                {[
                  { icon: <Instagram size={18} />, href: 'https://www.instagram.com/cantosdememorias' },
                  { icon: <Phone size={18} />, href: 'https://wa.me/5585996811925' },
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
                  <a href="https://wa.me/5585996811925" target="_blank" className="text-gray-400 hover:text-white">
                    (85) 99681-1925
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/cantosdememorias" target="_blank" className="text-gray-400 hover:text-white">
                    @cantosdememorias
                  </a>
                </li>
              </ul>
            </div>

            {/* Links - Hidden on very small screens */}
            <div className="hidden lg:block">
              <h4 className="font-bold text-sm mb-4 text-violet-400">Links</h4>
              <ul className="space-y-2 text-sm">
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
        href="https://wa.me/5585996811925?text=Olá! Gostaria de saber mais sobre as músicas personalizadas."
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

      {/* Popup de Cupom */}
      <CouponPopup onUseCoupon={handleUseCoupon} />

      {/* Notificações de compra (social proof) */}
      <PurchaseNotifications />
    </main>
  );
}
