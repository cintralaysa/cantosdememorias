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
    <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 group">
      {/* Imagem - Menor no mobile */}
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
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {item.type === 'music' ? (
              <Music size={32} className="text-gray-300" />
            ) : (
              <Mic2 size={32} className="text-gray-300" />
            )}
          </div>
        )}

        {/* Botão de play centralizado */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
            isPlaying
              ? 'bg-violet-500 scale-100 shadow-lg'
              : 'bg-white/90 scale-90 group-hover:scale-100 shadow-md'
          }`}>
            {isPlaying ? (
              <Pause size={20} className="text-white" />
            ) : (
              <Play size={20} className="text-gray-900 ml-0.5" />
            )}
          </div>
        </button>

        {/* Badge de tipo - Menor no mobile */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <span className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
            item.type === 'music'
              ? 'bg-violet-500/90 text-white'
              : 'bg-purple-500/90 text-white'
          }`}>
            {item.type === 'music' ? '♪' : '🎙️'}
          </span>
        </div>

        {/* Player quando tocando */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-2 text-white text-[10px] sm:text-xs">
              <span>{currentTime}</span>
              <div
                className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer overflow-hidden"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{duration}</span>
            </div>
          </div>
        )}
      </div>

      {/* Info - Compacto no mobile */}
      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-1">
          {item.title}
        </h3>
        <p className="text-gray-500 text-[10px] sm:text-xs line-clamp-2">
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
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header - Menor no mobile */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-block text-violet-600 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-4">
            Nosso Trabalho
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Portfólio
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Ouça alguns trabalhos que já realizamos
          </p>
        </div>

        {/* Filtros - Compactos no mobile */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all ${
              filter === 'all'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilter('music')}
            className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
              filter === 'music'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Music size={14} />
            <span className="hidden sm:inline">Músicas</span>
          </button>
          <button
            onClick={() => setFilter('voiceover')}
            className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all flex items-center gap-1.5 ${
              filter === 'voiceover'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600'
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
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Music size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">Nenhum item encontrado.</p>
          </div>
        )}

        {/* CTA - Menor no mobile */}
        <div className="text-center mt-8 sm:mt-12">
          <a
            href="#servicos"
            className="btn-gold inline-flex items-center gap-2 text-sm sm:text-base px-5 py-3 sm:px-6 sm:py-3"
          >
            <Music size={18} />
            <span>Criar Minha Música</span>
          </a>
        </div>
      </div>
    </section>
  );
}
