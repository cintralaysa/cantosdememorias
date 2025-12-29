import Link from 'next/link';
import { Music } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF6] px-4 text-center">
      <div className="bg-black p-4 rounded-3xl mb-8 rotate-[-5deg] shadow-[8px_8px_0_0_rgba(239,68,68,1)]">
        <Music size={64} className="text-white" />
      </div>
      <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">404</h1>
      <p className="text-xl font-bold uppercase mb-8 text-gray-500 italic">Essa melodia ainda não foi composta...</p>
      <Link 
        href="/" 
        className="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-500 transition-colors shadow-[8px_8px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
      >
        Voltar ao Início
      </Link>
    </div>
  );
}