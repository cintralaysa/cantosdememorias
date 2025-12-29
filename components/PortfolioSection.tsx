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
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2">
      {/* Imagem */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {item.type === 'music' ? (
              <Music size={56} className="text-gray-300" />
            ) : (
              <Mic2 size={56} className="text-gray-300" />
            )}
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Botão de play centralizado */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
            isPlaying
              ? 'bg-violet-500 scale-100 shadow-xl shadow-violet-500/30'
              : 'bg-white/90 scale-75 group-hover:scale-100 shadow-xl'
          }`}>
            {isPlaying ? (
              <Pause size={28} className="text-white" />
            ) : (
              <Play size={28} className="text-gray-900 ml-1" />
            )}
          </div>
        </button>

        {/* Badge de tipo */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md ${
            item.type === 'music'
              ? 'bg-violet-500/90 text-white'
              : 'bg-purple-500/90 text-white'
          }`}>
            {item.type === 'music' ? 'Música' : 'Locução'}
          </span>
        </div>

        {/* Badge de ocasião */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-md">
            {item.occasion}
          </span>
        </div>

        {/* Player minimalista no hover */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-3 text-white text-xs">
              <span>{currentTime}</span>
              <div
                className="flex-1 h-1.5 bg-white/30 rounded-full cursor-pointer overflow-hidden"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{duration}</span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-violet-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {item.relationship && (
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
              {item.relationship}
            </span>
          )}
          {item.clientName && (
            <span className="bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-xs font-medium">
              {item.clientName}
            </span>
          )}
        </div>
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
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-violet-600 font-semibold text-sm uppercase tracking-wider mb-4">
            Nosso Trabalho
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Portfólio de Criações
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cada música e mensagem carrega uma história única. Ouça alguns dos trabalhos que já realizamos.
          </p>
        </div>

        {/* Filtros elegantes */}
        <div className="flex justify-center gap-2 mb-12">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
              filter === 'all'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos ({allItems.length})
          </button>
          <button
            onClick={() => setFilter('music')}
            className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              filter === 'music'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Music size={16} />
            Músicas ({getMusicItems().length})
          </button>
          <button
            onClick={() => setFilter('voiceover')}
            className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
              filter === 'voiceover'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Mic2 size={16} />
            Locuções ({getVoiceoverItems().length})
          </button>
        </div>

        {/* Grid de itens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <AudioPlayer item={item} />
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">Nenhum item encontrado nesta categoria.</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">Quer ter sua própria música personalizada?</p>
          <a
            href="#servicos"
            className="btn-gold inline-flex items-center gap-3"
          >
            <Music size={20} />
            <span>Criar Minha Música</span>
          </a>
        </div>
      </div>
    </section>
  );
}
