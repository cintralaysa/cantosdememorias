'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF6] px-4 text-center">
      <div className="bg-violet-500 border-4 border-black p-4 rounded-full mb-8 shadow-[8px_8px_0_0_#000]">
        <AlertTriangle size={64} className="text-black" />
      </div>
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Algo desafinou!</h2>
      <p className="text-xl font-bold text-gray-500 uppercase mb-8 max-w-md">Tivemos um pequeno erro técnico. Vamos tentar novamente?</p>
      <button
        onClick={() => reset()}
        className="bg-black text-white px-12 py-6 rounded-2xl text-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-[8px_8px_0_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none"
      >
        Tentar Novamente
      </button>
    </div>
  );
}