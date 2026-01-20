'use client';

import { SERVICES, TESTIMONIALS } from '@/lib/data';
import { Music, PlayCircle, Star, Heart, Clock, ArrowRight, Mic2, Volume2, Headphones, Award, Users, Sparkles, ChevronRight, ChevronDown, Phone, Mail, Instagram, Shield, Gift, Zap, Check, RefreshCw, Play } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PortfolioSection from '@/components/PortfolioSection';
import CheckoutModal from '@/components/CheckoutModal';
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
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute text-violet-400/40 animate-particle select-none"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 5}s`,
          fontSize: `${14 + Math.random() * 16}px`,
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

  const faqData = [
    {
      question: "Como funciona a criação de uma música personalizada?",
      answer: "O processo é simples e rápido: 1) Você preenche um formulário contando a história e detalhes da pessoa homenageada; 2) Nosso sistema gera uma letra personalizada que você pode aprovar ou editar; 3) Escolha entre o Plano Básico ou Premium; 4) Após o pagamento, entregamos sua música via WhatsApp."
    },
    {
      question: "Quanto custa uma música personalizada?",
      answer: "Temos dois planos: Plano Básico por R$49,90 (1 melodia, entrega em 48h) e Plano Premium por R$79,90 (2 melodias diferentes, entrega em 24h). Em ambos você aprova a letra antes de pagar!"
    },
    {
      question: "Qual a diferença entre os planos?",
      answer: "No Plano Básico (R$49,90) você recebe 1 melodia exclusiva com entrega em até 48 horas. No Plano Premium (R$79,90) você recebe 2 melodias diferentes da mesma letra e a entrega é mais rápida, em até 24 horas."
    },
    {
      question: "Em quanto tempo recebo minha música?",
      answer: "Depende do plano escolhido: Plano Básico tem entrega em até 48 horas, e o Plano Premium em até 24 horas após a confirmação do pagamento. Você recebe as músicas diretamente no seu WhatsApp."
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
              href="#servicos"
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
          HERO SECTION - DESIGN PREMIUM OTIMIZADO MOBILE
          ================================================================ */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center overflow-hidden">
        {/* Background Gradient Premium */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-violet-950 to-purple-950" />

        {/* Audio Element Hidden */}
        <audio
          ref={audioRef}
          src={heroAudioSrc}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge Premium - Menor no mobile */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full mb-4 sm:mb-8">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-amber-400 fill-amber-400" size={12} />
                  ))}
                </div>
                <span className="text-white/90 text-xs sm:text-sm font-medium">
                  +7.234 músicas criadas
                </span>
              </div>

              {/* Título Principal - Menor no mobile */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-4 sm:mb-6">
                Transforme
                <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Sentimentos
                </span>
                <span className="block mt-1 sm:mt-2">em Música</span>
              </h1>

              {/* Subtítulo - Menor no mobile */}
              <p className="text-base sm:text-lg text-white/70 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
                Crie uma música <span className="text-white font-semibold">exclusiva</span> para eternizar momentos especiais.
                <span className="block mt-1 text-violet-300 text-sm sm:text-base">Entrega rápida • Aprove antes de pagar</span>
              </p>

              {/* CTA Principal */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                <button
                  onClick={() => { setSelectedPlan('basico'); setIsModalOpen(true); }}
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-base sm:text-lg font-bold px-6 py-4 sm:px-10 sm:py-5 rounded-full shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300"
                >
                  <Music size={20} />
                  <span>Criar Minha Música</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </button>
                <Link
                  href="#portfolio"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 sm:py-4 rounded-full font-bold transition-all duration-300 hover:bg-white/20"
                >
                  <PlayCircle size={18} />
                  <span>Ouvir Exemplos</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6 sm:mt-10 pt-4 sm:pt-8 border-t border-white/10">
                {[
                  { icon: <Clock size={16} />, label: 'Entrega', sub: 'Super Rápida' },
                  { icon: <Heart size={16} />, label: '+7.234', sub: 'Músicas Criadas' },
                  { icon: <Shield size={16} />, label: 'Pagamento', sub: '100% Seguro' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg flex items-center justify-center text-violet-300">
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-xs sm:text-sm font-medium leading-tight">{item.label}</span>
                      <span className="text-white/50 text-[10px] sm:text-xs">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Player Premium */}
            <div className="relative hidden lg:block">
              {/* Glow Effect Behind Card */}
              <div className={`absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-[3rem] blur-3xl opacity-30 ${isPlaying ? 'animate-pulse' : ''}`} />

              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                {/* Playing Now Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                      <Music className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl">Para Minha Mãe</h3>
                      <p className="text-white/50 text-sm">Música Personalizada</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="text-amber-400 fill-amber-400" size={14} />
                    ))}
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="h-32 flex items-center justify-center gap-[3px] mb-8 bg-white/5 rounded-2xl p-6">
                  {[...Array(40)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-gradient-to-t from-violet-600 via-purple-500 to-pink-400 rounded-full transition-all duration-300"
                      style={{
                        height: isPlaying ? `${20 + Math.sin(i * 0.3 + currentTime) * 30}%` : `${20 + Math.sin(i * 0.3) * 20}%`,
                        opacity: isPlaying ? 0.6 + Math.sin(i * 0.2) * 0.4 : 0.3,
                      }}
                    />
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-violet-400 text-sm font-mono">{formatTime(currentTime)}</span>
                  <div
                    className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                    onClick={(e) => {
                      if (audioRef.current && duration) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        audioRef.current.currentTime = percent * duration;
                      }
                    }}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full relative transition-all duration-100"
                      style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-violet-500/50" />
                    </div>
                  </div>
                  <span className="text-white/30 text-sm font-mono">{formatTime(duration)}</span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10); }}
                    className="w-12 h-12 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                  </button>
                  <button
                    onClick={togglePlay}
                    className={`w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-violet-500/50 hover:scale-110 transition-transform`}
                  >
                    {isPlaying ? (
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <PlayCircle size={40} />
                    )}
                  </button>
                  <button
                    onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10); }}
                    className="w-12 h-12 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 18h2V6h-2zM6 18l8.5-6L6 6z"/></svg>
                  </button>
                </div>

                {/* Badge Entrega Rápida */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Entrega Expressa
                </div>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Music className="text-white" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900">+7.234</div>
                    <div className="text-xs text-gray-500">Músicas Criadas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Hidden on mobile */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <a href="#servicos" className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors">
            <ChevronDown size={20} />
          </a>
        </div>
      </section>

      {/* ================================================================
          SERVIÇOS - SEÇÃO PREMIUM OTIMIZADA
          ================================================================ */}
      <section id="servicos" className="py-12 sm:py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header - Menor no mobile */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full mb-4 sm:mb-6">
              <Gift className="text-violet-600" size={16} />
              <span className="text-violet-700 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Presente Inesquecível
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-6">
              Música <span className="text-gradient-royal">Personalizada</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Transforme sentimentos em uma canção única
            </p>
          </div>

          {/* Destaque - Criação da letra no site */}
          <div className="mb-6 sm:mb-10 bg-gradient-to-r from-violet-50 via-purple-50 to-violet-50 border border-violet-200/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-2xl mx-auto shadow-lg shadow-violet-100/50">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
                <Sparkles className="text-white w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="text-violet-900 font-bold text-sm sm:text-lg">Você cria a letra aqui no site!</p>
                <p className="text-violet-600 text-xs sm:text-sm">Gere, visualize e edite antes de pagar. Sem surpresas!</p>
              </div>
            </div>
          </div>

          {/* Dois Planos - Premium Design Responsivo */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8">

              {/* Plano Essencial */}
              <div className="group relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100 flex flex-col hover:shadow-violet-200/50 transition-all duration-500">
                {/* Decoração superior gradiente */}
                <div className="h-1.5 sm:h-2 bg-gradient-to-r from-violet-400 via-purple-500 to-violet-600" />

                {/* Conteúdo */}
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col flex-1">
                  {/* Header com ícone */}
                  <div className="flex items-start justify-between mb-3 sm:mb-5">
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-violet-600 uppercase tracking-wider">Essencial</span>
                      <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-gray-900 mt-0.5 sm:mt-1">Básico</h3>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
                      <Music className="text-violet-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>

                  {/* Preço elegante */}
                  <div className="mb-3 sm:mb-5 pb-3 sm:pb-5 border-b border-gray-100">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-sm sm:text-lg text-gray-400 font-medium">R$</span>
                      <span className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900">49</span>
                      <span className="text-base sm:text-xl lg:text-2xl font-bold text-gray-400">,90</span>
                    </div>
                    <p className="text-gray-400 text-[10px] sm:text-xs mt-1">Pagamento único</p>
                  </div>

                  {/* Entrega com destaque visual */}
                  <div className="bg-gradient-to-r from-violet-100 via-purple-100 to-violet-100 rounded-xl p-3 sm:p-4 mb-3 sm:mb-5 border-2 border-violet-200 shadow-md shadow-violet-100">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 bg-white rounded-lg flex items-center justify-center shadow-md border border-violet-200">
                        <Clock className="text-violet-600 w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm sm:text-base lg:text-lg font-black text-violet-800 block">48 horas</span>
                        <span className="text-[10px] sm:text-xs text-violet-600 font-medium">de entrega</span>
                      </div>
                    </div>
                  </div>

                  {/* Features elegantes */}
                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
                    <li className="flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-violet-600 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">1 Melodia exclusiva</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-violet-600 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">Letra personalizada</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-violet-600 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base">Aprove antes</span>
                    </li>
                  </ul>

                  {/* CTA Premium */}
                  <button
                    onClick={() => { setSelectedPlan('basico'); setIsModalOpen(true); }}
                    className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm lg:text-base shadow-xl shadow-gray-900/20 hover:shadow-gray-900/30 hover:scale-[1.02] transition-all duration-300"
                  >
                    <span>Começar</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Plano Premium - Destaque */}
              <div className="group relative bg-gradient-to-br from-gray-900 via-violet-950 to-purple-950 rounded-2xl sm:rounded-3xl shadow-2xl shadow-violet-500/25 overflow-hidden flex flex-col ring-2 ring-violet-400/50 ring-offset-2 ring-offset-gray-50">
                {/* Badge Premium */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 z-10">
                  <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 text-[8px] sm:text-[10px] lg:text-xs font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg shadow-amber-500/30 flex items-center gap-1">
                    <Star className="fill-amber-900 w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>POPULAR</span>
                  </div>
                </div>

                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

                {/* Conteúdo */}
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col flex-1 relative">
                  {/* Header com ícone */}
                  <div className="flex items-start justify-between mb-3 sm:mb-5">
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-violet-300 uppercase tracking-wider">Completo</span>
                      <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-white mt-0.5 sm:mt-1">Premium</h3>
                    </div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                      <Award className="text-violet-300 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                  </div>

                  {/* Preço elegante */}
                  <div className="mb-3 sm:mb-5 pb-3 sm:pb-5 border-b border-white/10">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-sm sm:text-lg text-violet-300 font-medium">R$</span>
                      <span className="text-3xl sm:text-5xl lg:text-6xl font-black text-white">79</span>
                      <span className="text-base sm:text-xl lg:text-2xl font-bold text-violet-300">,90</span>
                    </div>
                    <p className="text-violet-300/60 text-[10px] sm:text-xs mt-1">Pagamento único</p>
                  </div>

                  {/* Entrega EXPRESSA - Destaque máximo */}
                  <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-xl p-3 sm:p-4 mb-3 sm:mb-5 shadow-lg shadow-amber-400/50 border-2 border-amber-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-white/30 pointer-events-none" />
                    <div className="flex items-center justify-center gap-2 relative">
                      <div className="w-7 h-7 sm:w-9 sm:h-9 bg-white rounded-lg flex items-center justify-center shadow-md border border-amber-300">
                        <Zap className="text-amber-600 w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-center">
                        <span className="text-sm sm:text-base lg:text-lg font-black text-amber-900 block">24 horas</span>
                        <span className="text-[10px] sm:text-xs text-amber-800 font-semibold">entrega expressa</span>
                      </div>
                    </div>
                  </div>

                  {/* Features elegantes */}
                  <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
                    <li className="flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-violet-500/30 rounded-full flex items-center justify-center flex-shrink-0 border border-violet-400/30">
                        <Check className="text-violet-300 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className="font-semibold text-white text-xs sm:text-sm lg:text-base">2 Melodias diferentes</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-violet-500/30 rounded-full flex items-center justify-center flex-shrink-0 border border-violet-400/30">
                        <Check className="text-violet-300 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className="font-semibold text-white text-xs sm:text-sm lg:text-base">Letra personalizada</span>
                    </li>
                    <li className="flex items-center gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-violet-500/30 rounded-full flex items-center justify-center flex-shrink-0 border border-violet-400/30">
                        <Check className="text-violet-300 w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                      <span className="font-semibold text-white text-xs sm:text-sm lg:text-base">Aprove antes</span>
                    </li>
                  </ul>

                  {/* CTA Premium */}
                  <button
                    onClick={() => { setSelectedPlan('premium'); setIsModalOpen(true); }}
                    className="w-full flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 text-white px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm lg:text-base shadow-xl shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-[1.02] transition-all duration-300"
                  >
                    <span>Escolher Premium</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-10 sm:mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: <Clock size={20} />, text: 'Entrega Expressa', desc: 'Até 24h' },
              { icon: <Shield size={20} />, text: 'Pagamento Seguro', desc: 'PIX protegido' },
              { icon: <Music size={20} />, text: '+7.234 Músicas', desc: 'Criadas' },
              { icon: <Star size={20} />, text: 'Aprovação', desc: 'Antes de pagar' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4 sm:p-5 bg-white rounded-2xl shadow-lg shadow-gray-100 border border-gray-50">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-3">
                  {item.icon}
                </div>
                <span className="text-gray-900 font-bold text-sm">{item.text}</span>
                <span className="text-gray-400 text-xs mt-1">{item.desc}</span>
              </div>
            ))}
          </div>

          {/* Selo de Garantia - Destaque */}
          <div className="mt-8 sm:mt-12 max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg shadow-green-100/50">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  GARANTIA
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                  <RefreshCw className="text-white w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <p className="text-green-900 font-black text-base sm:text-xl">Não gostou da letra? Ajustamos grátis!</p>
                  <p className="text-green-700 text-xs sm:text-sm mt-1">Você aprova e pode pedir ajustes até ficar 100% satisfeito</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          VÍDEO DE REAÇÃO - CARROSSEL DE REELS DO INSTAGRAM
          ================================================================ */}
      <InstagramReelsSection onOpenModal={() => { setSelectedPlan('basico'); setIsModalOpen(true); }} />

      {/* ================================================================
          COMO FUNCIONA - OTIMIZADO MOBILE
          ================================================================ */}
      <section id="como-funciona" className="py-12 sm:py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header - Menor no mobile */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full mb-3 sm:mb-6">
              <Zap className="text-violet-600" size={14} />
              <span className="text-violet-700 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Super Simples
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-4">
              Como <span className="text-gradient-royal">Funciona</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
              3 passos para emocionar quem você ama
            </p>
          </div>

          {/* Steps - Compacto mas informativo no mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-10 max-w-4xl mx-auto">
            {[
              { step: 1, icon: <Heart className="fill-current" size={20} />, title: 'Conte sua história', desc: 'Preencha o formulário com os detalhes da pessoa homenageada', color: 'from-pink-500 to-rose-500' },
              { step: 2, icon: <Sparkles size={20} />, title: 'Aprove a letra', desc: 'Veja e aprove a letra antes de pagar', color: 'from-violet-500 to-purple-500' },
              { step: 3, icon: <Music size={20} />, title: 'Receba em 48h', desc: 'Receba 2 melodias no WhatsApp', color: 'from-amber-500 to-orange-500' }
            ].map((item, index) => (
              <div key={index} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-0 bg-white sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none shadow-sm sm:shadow-none">
                <div className="relative flex-shrink-0 sm:mx-auto sm:mb-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 bg-white rounded-full flex items-center justify-center text-xs font-black shadow">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 sm:flex-none">
                  <span className="text-gray-900 font-bold text-sm sm:text-base block">{item.title}</span>
                  <span className="text-gray-500 text-xs sm:text-sm mt-1 block">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA - Menor no mobile */}
          <div className="text-center mt-8 sm:mt-12">
            <button
              onClick={() => { setSelectedPlan('basico'); setIsModalOpen(true); }}
              className="inline-flex items-center gap-2 btn-premium text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4"
            >
              <Music size={18} />
              <span>Começar Agora</span>
            </button>
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
          DEPOIMENTOS - OTIMIZADO MOBILE
          ================================================================ */}
      <section id="depoimentos" className="py-12 sm:py-20 lg:py-28 relative overflow-hidden bg-gradient-to-b from-white via-violet-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header - Menor no mobile */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full mb-3 sm:mb-6">
              <Heart className="text-violet-600 fill-violet-600" size={14} />
              <span className="text-violet-700 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Depoimentos
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-4">
              Histórias que <span className="text-gradient-royal">Emocionam</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              O que nossos clientes dizem
            </p>
          </div>

          {/* Testimonials - Scroll horizontal no mobile */}
          <div className="flex overflow-x-auto pb-4 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            {TESTIMONIALS.slice(0, 3).map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[85%] sm:w-auto snap-center testimonial-card rounded-2xl sm:rounded-3xl p-5 sm:p-8"
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-amber-400 fill-amber-400" size={14} />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed line-clamp-4 sm:line-clamp-none">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-violet-100"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-violet-600 font-medium">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FAQ - OTIMIZADO MOBILE
          ================================================================ */}
      <section id="faq" className="py-12 sm:py-20 lg:py-28 relative overflow-hidden bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header - Menor no mobile */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full mb-3 sm:mb-6">
              <Sparkles className="text-violet-600" size={14} />
              <span className="text-violet-700 font-semibold text-xs sm:text-sm uppercase tracking-wider">
                Dúvidas
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 sm:mb-4">
              Perguntas <span className="text-gradient-royal">Frequentes</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Respostas rápidas para você
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-2 sm:space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <a
              href="https://wa.me/5585996811925?text=Olá! Tenho uma dúvida sobre as músicas personalizadas."
              target="_blank"
              className="inline-flex items-center gap-2 text-violet-600 font-bold text-sm sm:text-base hover:text-violet-700 transition-colors"
            >
              <Phone size={16} />
              <span>Mais dúvidas? Fale conosco</span>
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
            <button
              onClick={() => { setSelectedPlan('basico'); setIsModalOpen(true); }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 btn-premium text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4"
            >
              <Music size={18} />
              <span>Criar Música</span>
            </button>
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
    </main>
  );
}
