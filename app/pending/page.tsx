'use client';

import { Clock, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PendingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <main className="pt-40 min-h-screen flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl">
          <Clock className="w-12 h-12 text-white" strokeWidth={3} />
        </div>

        <h1 className="text-5xl font-black mb-6 tracking-tighter uppercase">PAGAMENTO <br/>PENDENTE</h1>
        <p className="text-gray-500 font-medium text-lg mb-10">
          Seu pagamento está sendo processado. Assim que for confirmado, iniciaremos a produção da sua música.
        </p>

        {orderId && (
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
            <p className="text-sm text-yellow-700">
              <strong>Pedido:</strong> #{orderId}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">O que acontece agora?</p>
            <p className="text-sm font-bold text-gray-800 leading-relaxed">
              Pagamentos via boleto ou PIX podem levar alguns minutos para serem confirmados. Você receberá um e-mail assim que o pagamento for aprovado.
            </p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 text-left">
            <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-2">Importante</p>
            <p className="text-sm font-bold text-yellow-800 leading-relaxed">
              Se você pagou via PIX, aguarde alguns instantes e recarregue esta página para verificar o status.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-yellow-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-yellow-600 transition"
          >
            <RefreshCw className="w-5 h-5" />
            Verificar Status
          </button>

          <Link href="/" className="btn-black w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
            Voltar ao Início
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
