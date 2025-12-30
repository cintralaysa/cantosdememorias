'use client';

import { XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function FailurePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <main className="pt-40 min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl">
          <XCircle className="w-12 h-12 text-white" strokeWidth={3} />
        </div>

        <h1 className="text-5xl font-black mb-6 tracking-tighter uppercase">PAGAMENTO <br/>NÃO APROVADO</h1>
        <p className="text-gray-500 font-medium text-lg mb-10">
          Infelizmente seu pagamento não foi aprovado. Mas não se preocupe, você pode tentar novamente!
        </p>

        {orderId && (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6">
            <p className="text-sm text-red-700">
              <strong>Pedido:</strong> #{orderId}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Possíveis motivos</p>
            <ul className="text-sm text-gray-800 leading-relaxed space-y-2">
              <li>• Saldo insuficiente no cartão</li>
              <li>• Dados do cartão incorretos</li>
              <li>• Limite de crédito excedido</li>
              <li>• Bloqueio de segurança do banco</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 text-left">
            <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-2">Dica</p>
            <p className="text-sm font-bold text-yellow-800 leading-relaxed">
              Tente usar outro cartão ou pague via PIX para aprovação instantânea!
            </p>
          </div>

          <Link href="/" className="w-full py-5 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-violet-700 transition">
            <RefreshCw className="w-5 h-5" />
            Tentar Novamente
          </Link>

          <Link href="/" className="btn-black w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
            Voltar ao Início
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
