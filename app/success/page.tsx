import { Check, Music, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="pt-40 min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
        <h1 className="text-5xl font-black mb-6 tracking-tighter uppercase">PEDIDO <br/>CONFIRMADO</h1>
        <p className="text-gray-500 font-medium text-lg mb-10">
          Obrigado por escolher a Cantos de Memórias. Sua história já entrou em nossa linha de produção automatizada.
        </p>
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Próximo Passo</p>
            <p className="text-sm font-bold text-gray-800 leading-relaxed">
              Você receberá um contato em seu WhatsApp e os arquivos finais em seu e-mail dentro do prazo estabelecido.
            </p>
          </div>
          <Link href="/" className="btn-black w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
            Voltar ao Início
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}