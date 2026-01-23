"use client";

import { useState, useRef } from 'react';
import { PortfolioItem, getFeaturedItems, getMusicItems, getVoiceoverItems } from '@/lib/portfolio';
import { Play, Pause, Music, Mic2, Heart, Volume2, VolumeX } from 'lucide-react';

function AudioPlayer({ item }: { item: PortfolioItem }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
      setCurrentTime(formatTime(audioRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(formatTime(audioRef.current.duration));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime('0:00');
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = clickPosition * audioRef.current.duration;
    }
  };

  return (
    <div className="bg-[#1a1333]/80 backdrop-blur border border-purple-500/20 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500/40 group">
      {/* Imagem */}
      <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-violet-900/50 flex items-center justify-center">
            {item.type === 'music' ? (
              <Music size={32} className="text-purple-400" />
            ) : (
              <Mic2 size={32} className="text-purple-400" />
            )}
          </div>
        )}

        {/* Botão de play centralizado */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
            isPlaying
              ? 'bg-violet-500 scale-100 shadow-lg shadow-violet-500/50'
              : 'bg-white/90 scale-90 group-hover:scale-100 shadow-lg'
          }`}>
            {isPlaying ? (
              <Pause size={22} className="text-white" />
            ) : (
              <Play size={22} className="text-gray-900 ml-0.5" />
            )}
          </div>
        </button>

        {/* Badge de tipo */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
            item.type === 'music'
              ? 'bg-violet-500 text-white'
              : 'bg-purple-500 text-white'
          }`}>
            {item.type === 'music' ? '♪' : '🎙️'}
          </span>
        </div>

        {/* Player quando tocando */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/90 to-transparent">
            <div className="flex items-center gap-2 text-white text-[10px] sm:text-xs">
              <span>{currentTime}</span>
              <div
                className="flex-1 h-1.5 bg-white/30 rounded-full cursor-pointer overflow-hidden"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{duration}</span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-white text-sm sm:text-base mb-1 line-clamp-1">
          {item.title}
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">
          {item.occasion}
        </p>
      </div>

      <audio
        ref={audioRef}
        src={item.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
    </div>
  );
}

export default function PortfolioSection() {
  const [filter, setFilter] = useState<'all' | 'music' | 'voiceover'>('all');

  const allItems = [...getMusicItems(), ...getVoiceoverItems()];
  const filteredItems = filter === 'all'
    ? allItems
    : filter === 'music'
      ? getMusicItems()
      : getVoiceoverItems();

  if (allItems.length === 0) {
    return null;
  }

  return (
    <section id="portfolio" className="py-12 sm:py-20 bg-gradient-to-b from-[#0f0a1e] via-[#1a1333] to-[#0f0a1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header - Menor no mobile */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-2 mb-4">
            <span className="text-lg">🎵</span>
            <span className="text-white text-sm font-medium uppercase tracking-wider">Nosso Trabalho</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
            Portfólio
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            Ouça alguns trabalhos que já realizamos
          </p>
        </div>

        {/* Filtros - Compactos no mobile */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('music')}
            className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
              filter === 'music'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Music size={14} />
            <span className="hidden sm:inline">Músicas</span>
          </button>
          <button
            onClick={() => setFilter('voiceover')}
            className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
              filter === 'voiceover'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <Mic2 size={14} />
            <span className="hidden sm:inline">Locuções</span>
          </button>
        </div>

        {/* Grid - 2 colunas no mobile, scroll horizontal opcional */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {filteredItems.map((item) => (
            <AudioPlayer key={item.id} item={item} />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Music size={24} className="text-purple-400" />
            </div>
            <p className="text-gray-400 text-sm">Nenhum item encontrado.</p>
          </div>
        )}

        {/* CTA - Menor no mobile */}
        <div className="text-center mt-8 sm:mt-12">
          <a
            href="#planos"
            className="inline-flex items-center gap-2 text-sm sm:text-base px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold rounded-full transition-all shadow-lg shadow-orange-500/30"
          >
            <Music size={18} />
            <span>Criar Minha Música</span>
          </a>
        </div>
      </div>
    </section>
  );
}
