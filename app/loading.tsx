import { Music } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF6]">
      <div className="relative">
        <div className="animate-ping absolute inset-0 bg-red-500 rounded-full opacity-20"></div>
        <div className="bg-black p-6 rounded-3xl relative z-10 animate-bounce">
          <Music size={48} className="text-white" />
        </div>
      </div>
      <p className="mt-8 font-black uppercase tracking-[0.5em] text-xs animate-pulse">Afinando os instrumentos...</p>
    </div>
  );
}