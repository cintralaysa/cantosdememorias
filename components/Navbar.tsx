"use client";

import Link from 'next/link';
import { Music, Instagram } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-full flex items-center justify-between shadow-2xl">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-violet-500 p-2.5 rounded-full group-hover:rotate-12 transition-transform">
              <Music size={20} className="text-black" strokeWidth={3} />
            </div>
            <span className="font-black text-xl uppercase tracking-tighter text-white">Cantos de Memórias</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10 font-bold uppercase text-[10px] tracking-[0.2em] text-gray-400">
            <Link href="/#servicos" className="hover:text-violet-400 transition-all">Serviços</Link>
            <Link href="/#como-funciona" className="hover:text-violet-400 transition-all">Como Funciona</Link>
            <Link href="https://instagram.com/cantosdememorias" target="_blank" className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-full font-black hover:bg-violet-500 hover:text-white transition-all">
              <Instagram size={14} /> Instagram
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}