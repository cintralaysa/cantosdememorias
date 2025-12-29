'use client';

import { SERVICES, TESTIMONIALS } from '@/lib/data';
import { Music, PlayCircle, Star, Heart, Clock, ArrowRight, Mic2, Volume2, Headphones, Award, Users, Sparkles, ChevronRight, ChevronDown, Phone, Mail, Instagram, Shield, Gift, Zap, Check } from 'lucide-react';
import Link from 'next/link';
import PortfolioSection from '@/components/PortfolioSection';
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

// Componente FAQ com Acordeão
const FAQItem = ({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) => (
  <div className={`faq-item ${isOpen ? 'active' : ''}`}>
    <button
      onClick={onClick}
      className="w-full p-6 flex items-center justify-between text-left"
    >
      <h3 className="text-lg font-bold text-gray-900 pr-4">{question}</h3>
      <ChevronDown
        className={`flex-shrink-0 text-violet-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        size={24}
      />
    </button>
    <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
      <p className="px-6 text-gray-600 leading-relaxed">{answer}</p>
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
  const audioRef = useRef<HTMLAudioElement>(null);

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
      answer: "O processo é simples e rápido: 1) Você preenche um formulário contando a história e detalhes da pessoa homenageada; 2) Nosso sistema gera uma letra personalizada que você pode aprovar ou editar; 3) Após o pagamento, entregamos 2 versões da música com melodias diferentes em até 24 horas via WhatsApp."
    },
    {
      question: "Quanto custa uma música personalizada?",
      answer: "A música personalizada custa R$79,99. O pacote inclui 2 melodias diferentes da mesma letra (compre 1, ganhe outra!), entrega em 24 horas e você aprova a letra antes de pagar. É o presente mais emocionante que você pode dar!"
    },
    {
      question: "Em quanto tempo recebo minha música?",
      answer: "A entrega é feita em até 24 horas após a confirmação do pagamento. Você recebe as músicas diretamente no seu WhatsApp, prontas para emocionar quem você ama."
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
      question: "Recebo quantas versões da música?",
      answer: "Você recebe 2 versões da música com melodias diferentes, usando a mesma letra que você aprovou. Assim você pode escolher a que mais combina com o momento ou usar as duas!"
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
          HERO SECTION - DESIGN PREMIUM COM PLAYER
          ================================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Gradient Premium */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-violet-950 to-purple-950" />

        {/* Animated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/10 to-pink-600/20 animate-gradient" style={{ backgroundSize: '400% 400%' }} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        {/* Audio Element Hidden */}
        <audio
          ref={audioRef}
          src={heroAudioSrc}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge Premium */}
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full mb-8">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-amber-400 fill-amber-400" size={14} />
                  ))}
                </div>
                <span className="text-white/90 text-sm font-medium">
                  +2.000 Clientes Emocionados
                </span>
              </div>

              {/* Título Principal */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6">
                Transforme
                <span className="block mt-2 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Sentimentos
                </span>
                <span className="block mt-2">em Música</span>
              </h1>

              {/* Subtítulo */}
              <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-xl mx-auto lg:mx-0">
                Crie uma música <span className="text-white font-semibold">exclusiva e personalizada</span> para eternizar momentos especiais.
                <span className="block mt-2 text-violet-300">Entrega em 24h • 2 Melodias • Aprove antes de pagar</span>
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="#servicos"
                  className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-lg font-bold px-10 py-5 rounded-full shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300"
                >
                  <Music size={24} />
                  <span>Criar Minha Música</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                <Link
                  href="#portfolio"
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
                >
                  <PlayCircle size={24} />
                  <span>Ouvir Exemplos</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-12 pt-8 border-t border-white/10">
                {[
                  { icon: <Clock size={20} />, label: '24h', sub: 'Entrega' },
                  { icon: <Gift size={20} />, label: '2 Melodias', sub: 'Compre 1, Ganhe 1' },
                  { icon: <Shield size={20} />, label: '100%', sub: 'Seguro' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-violet-300">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-white font-bold">{item.label}</div>
                      <div className="text-white/50 text-xs">{item.sub}</div>
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

                {/* Badge Entrega 24h */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Entrega 24h
                </div>
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Heart className="text-white fill-white" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900">+2.000</div>
                    <div className="text-xs text-gray-500">Clientes Felizes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <a href="#servicos" className="flex flex-col items-center gap-2 text-white/50 hover:text-white transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider">Explorar</span>
            <ChevronDown size={24} />
          </a>
        </div>
      </section>

      {/* ================================================================
          SERVIÇOS - SEÇÃO PREMIUM
          ================================================================ */}
      <section id="servicos" className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-900 to-transparent opacity-5" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 px-5 py-2 rounded-full mb-6">
              <Gift className="text-violet-600" size={18} />
              <span className="text-violet-700 font-semibold text-sm uppercase tracking-wider">
                Presente Inesquecível
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Música <span className="text-gradient-royal">Personalizada</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transforme sentimentos em uma canção única e emocionante
            </p>
          </div>

          {/* Single Product Card - Centralizado e Destacado */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl shadow-violet-500/10 overflow-hidden border border-gray-100">
              <div className="grid md:grid-cols-2">
                {/* Imagem */}
                <div className="relative h-72 md:h-auto">
                  <img
                    src="/portfolio/fotos/Gemini_Generated_Image_ct6qvxct6qvxct6q.png"
                    alt="Música Personalizada"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      <Zap size={16} />
                      COMPRE 1, GANHE OUTRA!
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                    <Music className="text-white" size={32} />
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <h3 className="text-3xl font-black text-gray-900 mb-4">
                    Sua História em Música
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Criamos uma canção exclusiva baseada na sua história. Perfeita para aniversários, casamentos, Dia das Mães, homenagens e momentos especiais.
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {[
                      'Letra exclusiva criada para você',
                      '2 Melodias diferentes incluídas',
                      'Entrega em até 24 horas',
                      'Aprove a letra antes de pagar'
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="text-white" size={14} />
                        </div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Preço e CTA */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-gray-100">
                    <div className="text-center sm:text-left">
                      <div className="text-gray-400 text-sm line-through">De R$ 159,98</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-gray-500">R$</span>
                        <span className="text-5xl font-black text-gradient-royal">79</span>
                        <span className="text-xl font-bold text-gray-500">,99</span>
                      </div>
                    </div>
                    <Link
                      href="/servicos/musica-personalizada"
                      className="w-full sm:w-auto flex-1 sm:flex-none flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all duration-300"
                    >
                      <span>Criar Minha Música</span>
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {[
              { icon: <Clock size={24} />, text: 'Entrega em 24h', color: 'from-green-500 to-emerald-500' },
              { icon: <Shield size={24} />, text: 'Pagamento Seguro', color: 'from-blue-500 to-cyan-500' },
              { icon: <Gift size={24} />, text: 'Compre 1, Ganhe 1', color: 'from-violet-500 to-purple-500' },
              { icon: <Heart size={24} />, text: '+2.000 Clientes', color: 'from-pink-500 to-rose-500' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-lg shadow-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {item.icon}
                </div>
                <span className="text-gray-900 font-bold text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          COMO FUNCIONA - TIMELINE PREMIUM
          ================================================================ */}
      <section id="como-funciona" className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 px-5 py-2 rounded-full mb-6">
              <Zap className="text-violet-600" size={18} />
              <span className="text-violet-700 font-semibold text-sm uppercase tracking-wider">
                Super Simples
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Como <span className="text-gradient-royal">Funciona</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Do seu coração para os ouvidos de quem você ama em apenas 3 passos
            </p>
          </div>

          {/* Steps - Horizontal Timeline */}
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-[10%] right-[10%] h-1 bg-gradient-to-r from-pink-500 via-violet-500 to-amber-500 rounded-full" />

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  step: 1,
                  icon: <Heart className="fill-current" size={28} />,
                  title: 'Conte sua História',
                  desc: 'Preencha o formulário com detalhes sobre a pessoa e o momento especial.',
                  color: 'from-pink-500 to-rose-500',
                  bgColor: 'bg-pink-50'
                },
                {
                  step: 2,
                  icon: <Sparkles size={28} />,
                  title: 'Aprove a Letra',
                  desc: 'Veja a letra gerada por IA e aprove antes de pagar. Edite se quiser!',
                  color: 'from-violet-500 to-purple-500',
                  bgColor: 'bg-violet-50'
                },
                {
                  step: 3,
                  icon: <Music size={28} />,
                  title: 'Receba em 24h',
                  desc: 'Após o pagamento, receba 2 melodias pelo WhatsApp. Pronto para emocionar!',
                  color: 'from-amber-500 to-orange-500',
                  bgColor: 'bg-amber-50'
                }
              ].map((item, index) => (
                <div key={index} className="relative group text-center">
                  {/* Step Circle */}
                  <div className="relative mx-auto mb-8">
                    <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform relative z-10`}>
                      {item.icon}
                    </div>
                    <div className={`absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-black shadow-lg z-20`}>
                      <span className={`bg-gradient-to-br ${item.color} bg-clip-text text-transparent`}>{item.step}</span>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className={`${item.bgColor} rounded-3xl p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-gray-100`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link
              href="#servicos"
              className="inline-flex items-center gap-3 btn-premium text-lg px-10 py-5"
            >
              <Music size={24} />
              <span>Começar Agora</span>
              <ArrowRight size={20} />
            </Link>
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
          DEPOIMENTOS PREMIUM
          ================================================================ */}
      <section id="depoimentos" className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-b from-white via-violet-50/30 to-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 px-5 py-2 rounded-full mb-6">
              <Heart className="text-violet-600 fill-violet-600" size={18} />
              <span className="text-violet-700 font-semibold text-sm uppercase tracking-wider">
                Depoimentos
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Histórias que <span className="text-gradient-royal">Emocionam</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Veja o que nossos clientes dizem sobre suas experiências
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="testimonial-card rounded-3xl p-8 hover:-translate-y-2 transition-all duration-500"
              >
                {/* Quote Mark */}
                <div className="quote-mark">"</div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-amber-400 fill-amber-400" size={18} />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-700 mb-8 leading-relaxed relative z-10">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-4 ring-violet-100"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-violet-600 font-medium">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FAQ PREMIUM
          ================================================================ */}
      <section id="faq" className="py-24 lg:py-32 relative overflow-hidden bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-100 border border-violet-200 px-5 py-2 rounded-full mb-6">
              <Sparkles className="text-violet-600" size={18} />
              <span className="text-violet-700 font-semibold text-sm uppercase tracking-wider">
                Tire suas Dúvidas
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6">
              Perguntas <span className="text-gradient-royal">Frequentes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encontre respostas para as dúvidas mais comuns sobre nossos serviços
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
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
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Ainda tem dúvidas?</p>
            <a
              href="https://wa.me/5585996811925?text=Olá! Tenho uma dúvida sobre as músicas personalizadas."
              target="_blank"
              className="inline-flex items-center gap-2 text-violet-600 font-bold hover:text-violet-700 transition-colors"
            >
              <Phone size={18} />
              <span>Fale conosco pelo WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA FINAL PREMIUM
          ================================================================ */}
      <section className="py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-full mb-8">
            <Heart className="text-pink-400 fill-pink-400" size={18} />
            <span className="text-white/90 font-semibold text-sm uppercase tracking-wider">
              Eternize Memórias
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
            Pronto para criar uma
            <span className="block mt-2 text-gradient-royal">memória eterna?</span>
          </h2>

          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Transforme seus sentimentos em uma música única. O presente mais emocionante que alguém pode receber.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#servicos"
              className="w-full sm:w-auto flex items-center justify-center gap-3 btn-premium text-lg px-10 py-5"
            >
              <Music size={24} />
              <span>Criar Minha Música</span>
            </Link>
            <a
              href="https://wa.me/5585996811925"
              target="_blank"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-5 rounded-full font-bold text-lg shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER PREMIUM
          ================================================================ */}
      <footer className="bg-gray-900 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Logo white />
              <p className="text-gray-400 mt-6 max-w-md leading-relaxed">
                Transformamos histórias em melodias únicas. Cada música é uma obra de arte criada especialmente para eternizar seus momentos mais especiais.
              </p>
              <div className="flex items-center gap-4 mt-6">
                {[
                  { icon: <Instagram size={20} />, href: 'https://www.instagram.com/cantosdememorias' },
                  { icon: <Phone size={20} />, href: 'https://wa.me/5585996811925' },
                  { icon: <Mail size={20} />, href: 'mailto:contato@cantosdememoria.com' },
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    target="_blank"
                    className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/70 hover:bg-violet-600 hover:text-white transition-all duration-300"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-violet-400">Links Rápidos</h4>
              <ul className="space-y-4">
                {['Serviços', 'Portfólio', 'Como Funciona', 'Depoimentos', 'Perguntas Frequentes'].map((item, i) => (
                  <li key={i}>
                    <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-violet-400">Contato</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-400">
                  <Phone size={18} className="text-violet-400" />
                  <a href="https://wa.me/5585996811925" target="_blank" className="hover:text-white transition-colors">
                    (85) 99681-1925
                  </a>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Mail size={18} className="text-violet-400" />
                  <span>contato@cantosdememoria.com</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <Instagram size={18} className="text-violet-400" />
                  <a href="https://www.instagram.com/cantosdememorias" target="_blank" className="hover:text-white transition-colors">
                    @cantosdememorias
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 Cantos de Memórias. Todos os direitos reservados.
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-2">
              Feito com <Heart className="text-pink-500 fill-pink-500" size={14} /> para você
            </p>
          </div>
        </div>
      </footer>

      {/* ================================================================
          BOTÃO WHATSAPP FLUTUANTE PREMIUM
          ================================================================ */}
      <a
        href="https://wa.me/5585996811925?text=Olá! Gostaria de saber mais sobre as músicas personalizadas."
        target="_blank"
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Falar no WhatsApp"
      >
        <div className="relative">
          {/* Pulse Effect */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />

          {/* Button */}
          <div className="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 transition-all duration-300 hover:scale-110 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>

          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Fale conosco
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      </a>
    </main>
  );
}
