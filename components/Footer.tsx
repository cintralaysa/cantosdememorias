"use client";

import { Instagram, Facebook, Music } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#05050a] border-t border-white/5 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <Music className="text-[#d4af37]" size={32} />
              <span className="font-black text-3xl uppercase tracking-tighter gold-text-glow italic">Cantos de Memórias</span>
            </div>
            <p className="font-medium text-gray-400 text-lg max-w-md leading-relaxed">
              Gravadora e produtora especializada em composições sob medida. Unimos sensibilidade artística e tecnologia de estúdio para eternizar momentos.
            </p>
            <div className="flex gap-6">
              <Link href="https://instagram.com/cantosdememorias" target="_blank" className="text-gray-400 hover:text-[#d4af37] transition-all">
                <Instagram size={28} />
              </Link>
              <Link href="https://facebook.com/cantosdememorias" target="_blank" className="text-gray-400 hover:text-[#d4af37] transition-all">
                <Facebook size={28} />
              </Link>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="font-black uppercase text-[#d4af37] tracking-widest text-sm">Produção</h4>
            <ul className="space-y-4 font-bold text-gray-500 uppercase text-xs tracking-widest">
              <li><Link href="/#servicos" className="hover:text-white transition-all">Composições</Link></li>
              <li><Link href="/#servicos" className="hover:text-white transition-all">Locuções</Link></li>
              <li><Link href="#" className="hover:text-white transition-all">Portfólio</Link></li>
            </ul>
          </div>

          <div className="space-y-6 md:text-right">
            <h4 className="font-black uppercase text-[#d4af37] tracking-widest text-sm">Sede Digital</h4>
            <p className="text-gray-500 font-bold uppercase text-[10px] leading-loose">
              Estúdio Cantos de Memórias<br />
              Conexão Brasil-Mundo<br />
              Atendimento 24h via WhatsApp
            </p>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-black uppercase text-gray-600 tracking-[0.4em]">
            © 2024 CANTOS DE MEMÓRIAS STUDIOS | CNPJ 00.000.000/0001-00
          </p>
          <div className="flex items-center gap-4 text-[9px] font-black uppercase text-gray-600 tracking-widest">
            <span>Privacidade</span>
            <span>•</span>
            <span>Termos de Uso</span>
          </div>
        </div>
      </div>
    </footer>
  );
}