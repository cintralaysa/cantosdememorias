'use client';

import { useState, useEffect } from 'react';

const NOTIFICATIONS = [
  { name: 'Ana C.', city: 'São Paulo', action: 'comprou uma música para sua mãe', plan: 'basico', emoji: '👩' },
  { name: 'Rafael M.', city: 'Rio de Janeiro', action: 'comprou o Plano Premium para sua namorada', plan: 'premium', emoji: '👨' },
  { name: 'Juliana P.', city: 'Belo Horizonte', action: 'encomendou uma música de aniversário', plan: 'basico', emoji: '👩' },
  { name: 'Carlos S.', city: 'Fortaleza', action: 'comprou uma música para o casamento', plan: 'premium', emoji: '👨' },
  { name: 'Fernanda L.', city: 'Curitiba', action: 'encomendou uma música para o chá revelação', plan: 'premium', emoji: '👩' },
  { name: 'Bruno A.', city: 'Salvador', action: 'comprou o Plano Premium para sua esposa', plan: 'premium', emoji: '👨' },
  { name: 'Patrícia R.', city: 'Recife', action: 'encomendou uma música para o Dia das Mães', plan: 'basico', emoji: '👩' },
  { name: 'Lucas F.', city: 'Brasília', action: 'comprou uma música para sua filha', plan: 'premium', emoji: '👨' },
];

export default function PurchaseNotifications() {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Primeira notificação após 8 segundos
    const initialTimer = setTimeout(() => {
      setCurrentIndex(0);
      setVisible(true);
    }, 8000);

    return () => clearTimeout(initialTimer);
  }, []);

  useEffect(() => {
    if (currentIndex < 0) return;

    // Esconder após 5 segundos
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    // Próxima notificação após 10-15 segundos
    const nextTimer = setTimeout(() => {
      const next = (currentIndex + 1) % NOTIFICATIONS.length;
      setCurrentIndex(next);
      setVisible(true);
    }, 10000 + Math.random() * 5000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex]);

  if (currentIndex < 0) return null;

  const notification = NOTIFICATIONS[currentIndex];
  const timeAgo = `${Math.floor(Math.random() * 5) + 1} min atrás`;

  return (
    <div
      className={`fixed bottom-24 left-4 sm:bottom-6 sm:left-6 z-40 max-w-xs transition-all duration-500 ${
        visible
          ? 'translate-x-0 opacity-100'
          : '-translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-3 sm:p-4 border border-gray-100 flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
          {notification.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-xs sm:text-sm leading-snug">
            <span className="font-bold">{notification.name}</span>
            <span className="text-gray-500"> de {notification.city}</span>
            {' '}{notification.action} 🎵
          </p>
          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block"></span>
            {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}
