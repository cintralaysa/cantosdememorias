'use client';

interface PlanosProps {
  onSelectPlan: (plan: 'basico' | 'premium') => void;
}

export default function Planos({ onSelectPlan }: PlanosProps) {
  return (
    <section id="planos" className="py-10 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-[#0f0a1e] via-[#1a1333] to-[#0f0a1e]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6">
            <span className="text-base sm:text-lg">✨</span>
            <span className="text-white text-xs sm:text-sm font-medium uppercase tracking-wider">Planos Exclusivos</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white mb-3 sm:mb-4">
            Sua História em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500">Melodia</span>
          </h2>

          <p className="text-gray-400 max-w-xl mx-auto mb-4 sm:mb-6 text-sm sm:text-base">
            Uma música exclusiva e emocionante, criada especialmente para eternizar seu momento mais especial.
          </p>

          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span className="text-yellow-400 text-xs sm:text-sm font-medium">Preços exclusivos apenas pelo site</span>
            </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {/* Plano Básico */}
          <div className="relative bg-[#1a1333]/80 backdrop-blur border border-purple-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all hover:border-purple-500/40">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">1 Música Personalizada</h3>

            <div className="inline-flex items-center bg-violet-500/20 border border-violet-500/30 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 mb-3">
              <span className="text-violet-300 text-xs sm:text-sm font-medium">🎵 2 MELODIAS INCLUÍDAS</span>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-gray-400 text-base sm:text-lg">R$</span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">39</span>
              <span className="text-xl sm:text-2xl text-white">,90</span>
            </div>

            <div className="flex items-center gap-2 text-purple-400 text-xs sm:text-sm mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Entrega automática em minutos
            </div>

            <div className="inline-flex items-center bg-green-500/20 border border-green-500/30 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 mb-5 sm:mb-8">
              <span className="text-green-400 text-xs sm:text-sm font-medium">EXCLUSIVO SITE</span>
            </div>

            <ul className="space-y-2.5 sm:space-y-4 mb-5 sm:mb-8">
              {[
                '1 letra exclusiva personalizada',
                '2 melodias exclusivas da mesma letra',
                'Download MP3 + letra em texto',
                'Link exclusivo por 30 dias',
                'Suporte via E-mail',
                'Entrega automática em minutos',
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-xs sm:text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan('basico')}
              className="w-full py-3 sm:py-4 rounded-xl font-semibold transition-all bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Criar Minha Música
            </button>

            <p className="text-center text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
              Satisfação garantida ou seu dinheiro de volta
            </p>
          </div>

          {/* Plano Premium — MAIS VENDIDO */}
          <div className="relative bg-[#1a1333]/80 backdrop-blur border-2 border-orange-500/50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all hover:border-orange-500/70 overflow-visible ring-1 ring-orange-500/20 shadow-lg shadow-orange-500/10">
            {/* Badge MAIS VENDIDO */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-black flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-rose-500/40 z-10 whitespace-nowrap">
              <span className="text-sm sm:text-base">🔥</span>
              MAIS VENDIDO
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 mt-2">3 Músicas Personalizadas</h3>

            <div className="inline-flex items-center bg-purple-500/20 border border-purple-500/30 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 mb-3 sm:mb-4">
              <span className="text-purple-300 text-xs sm:text-sm font-medium">🎵 3 MÚSICAS + 6 MELODIAS</span>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-gray-400 text-base sm:text-lg">R$</span>
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-white">79</span>
              <span className="text-xl sm:text-2xl text-white">,90</span>
            </div>

            <div className="flex items-center gap-2 text-orange-400 text-xs sm:text-sm mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Entrega automática em minutos
            </div>

            <div className="inline-flex items-center bg-green-500/20 border border-green-500/30 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 mb-5 sm:mb-6">
              <span className="text-green-400 text-xs sm:text-sm font-medium">EXCLUSIVO SITE</span>
            </div>

            <ul className="space-y-2.5 sm:space-y-4 mb-5 sm:mb-8">
              {[
                { text: '3 letras exclusivas personalizadas', bold: true },
                { text: '2 melodias exclusivas por letra', bold: true },
                { text: '6 melodias no total', bold: true },
                { text: 'Download MP3 + letra em texto', bold: false },
                { text: 'Suporte prioritário', bold: false },
                { text: 'Entrega automática em minutos', bold: false },
                { text: 'Link exclusivo por 30 dias', bold: false },
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2 sm:gap-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={`text-xs sm:text-sm ${item.bold ? 'text-white font-semibold' : 'text-gray-300'}`}>{item.text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan('premium')}
              className="w-full py-3.5 sm:py-5 rounded-xl font-black transition-all bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-lg"
            >
              <span className="text-base sm:text-xl">🎵</span>
              Criar Minhas 3 Músicas
            </button>

            <p className="text-center text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
              Satisfação garantida ou seu dinheiro de volta
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
