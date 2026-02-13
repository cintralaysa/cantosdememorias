'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CouponPopupProps {
  onUseCoupon: () => void;
}

export default function CouponPopup({ onUseCoupon }: CouponPopupProps) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Só mostra 1x por sessão
    if (sessionStorage.getItem('couponPopupShown')) return;

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem('couponPopupShown', 'true');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleUseCoupon = () => {
    setVisible(false);
    onUseCoupon();
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('CANTOS10').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm animate-fadeInUp">
        <div className="relative bg-gradient-to-br from-purple-700 via-violet-600 to-pink-600 rounded-3xl p-6 text-center shadow-2xl overflow-hidden">
          {/* Partículas decorativas */}
          <div className="absolute top-4 left-6 text-2xl opacity-30 animate-pulse">✨</div>
          <div className="absolute top-8 right-8 text-xl opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}>🎵</div>
          <div className="absolute bottom-12 left-8 text-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>💜</div>
          <div className="absolute bottom-8 right-6 text-2xl opacity-30 animate-pulse" style={{ animationDelay: '0.3s' }}>✨</div>

          {/* Botão fechar */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10 transition z-10"
          >
            <X size={20} />
          </button>

          {/* Emoji de presente */}
          <div className="text-6xl mb-3 animate-bounce">🎁</div>

          {/* Título */}
          <h2 className="text-2xl font-black text-white mb-1">
            Presente Especial
          </h2>
          <p className="text-white/80 text-sm mb-4">
            Exclusivo para você que acabou de chegar!
          </p>

          {/* Desconto */}
          <div className="bg-white/15 backdrop-blur rounded-2xl p-4 mb-4">
            <p className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-1">
              Ganhe
            </p>
            <p className="text-5xl font-black text-white mb-1">
              10% <span className="text-3xl">OFF</span>
            </p>
            <p className="text-white/70 text-sm">
              em qualquer plano
            </p>
          </div>

          {/* Código do cupom */}
          <div className="mb-4">
            <p className="text-white/60 text-xs mb-2">Use o código:</p>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 bg-white/20 border-2 border-dashed border-white/40 rounded-xl px-6 py-2.5 transition hover:bg-white/30"
            >
              <span className="text-xl font-black text-white tracking-widest">CANTOS10</span>
              <span className="text-xs text-white/60">{copied ? '✓ Copiado!' : '📋'}</span>
            </button>
          </div>

          {/* Botão usar cupom */}
          <button
            onClick={handleUseCoupon}
            className="w-full py-3.5 bg-white text-purple-700 rounded-xl font-black text-base hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] mb-3"
          >
            Usar Cupom Agora
          </button>

          {/* Não obrigado */}
          <button
            onClick={handleDismiss}
            className="text-white/50 text-xs hover:text-white/80 transition underline"
          >
            Não, obrigado
          </button>
        </div>
      </div>
    </div>
  );
}
