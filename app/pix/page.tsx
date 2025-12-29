'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Copy, Check, Clock, ArrowLeft, AlertCircle } from 'lucide-react';

export default function PixPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pixData, setPixData] = useState<{
    key: string;
    name: string;
    amount: number;
    description: string;
  } | null>(null);

  const [orderId, setOrderId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data));
        setPixData(parsed.pix);
        setOrderId(parsed.orderId);
        setLoading(false);
      } catch {
        setError('Dados inválidos');
        setLoading(false);
      }
    } else {
      setError('Nenhum dado de pagamento encontrado');
      setLoading(false);
    }
  }, [searchParams]);

  const copyToClipboard = async () => {
    if (pixData?.key) {
      await navigator.clipboard.writeText(pixData.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (error || !pixData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
          <p className="text-gray-600 mb-6">{error || 'Algo deu errado'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 512 512" className="w-12 h-12" fill="#00A859">
                <path d="M242.4 292.5c-18.4-13.5-38.4-25.3-59.9-35.3-5.9-2.7-11.9-5.2-18-7.5 19.1-8.9 36.3-21.2 50.5-36.9 17.4-19.2 29.8-42.6 35.5-68.2 3.8-17.2 4.7-35.2 2.3-52.6-2.4-17.4-8-34.1-16.4-49.1-8.4-15-19.6-28.2-32.8-38.9-13.2-10.7-28.3-18.7-44.4-23.5-16.1-4.8-33-6.5-49.8-4.9-16.9 1.6-33.2 6.6-47.9 14.6l-2.4 1.3-2.4 1.3c-14.1 8.4-26.3 19.5-36 32.5-9.6 13-16.8 27.9-21.1 43.6-4.3 15.7-5.7 32.2-4 48.4 1.7 16.2 6.3 31.9 13.6 46.2 7.3 14.3 17.1 27 29 37.6 11.9 10.6 25.6 18.9 40.4 24.5 14.8 5.6 30.4 8.5 46.1 8.4h.2c13.9-.1 27.7-2.3 40.8-6.6l-.2-.5c-3.4 2.1-6.9 4.1-10.5 5.9-11.2 5.5-23.1 9.7-35.4 12.5-12.3 2.8-25 4.1-37.7 3.9-12.7-.2-25.4-2-37.6-5.3-12.2-3.3-23.9-8.1-34.8-14.3-10.9-6.2-20.9-13.8-29.8-22.5-8.9-8.7-16.6-18.6-22.9-29.4-6.3-10.8-11.2-22.5-14.5-34.6-3.3-12.1-5-24.7-5-37.3 0-12.6 1.7-25.2 5-37.3 3.3-12.1 8.2-23.8 14.5-34.6 6.3-10.8 14-20.7 22.9-29.4 8.9-8.7 18.9-16.3 29.8-22.5 10.9-6.2 22.6-11 34.8-14.3 12.2-3.3 24.9-5.1 37.6-5.3 12.7-.2 25.4 1.1 37.7 3.9 12.3 2.8 24.2 7 35.4 12.5 11.2 5.5 21.6 12.3 31 20.3 9.4 8 17.8 17.2 25 27.3 7.2 10.1 13.1 21.1 17.6 32.7 4.5 11.6 7.5 23.8 9 36.3 1.5 12.5 1.4 25.2-.3 37.7-1.7 12.5-5 24.7-9.8 36.3-4.8 11.6-11.1 22.5-18.7 32.5-7.6 10-16.5 19-26.4 26.8-9.9 7.8-20.8 14.3-32.3 19.4-11.5 5.1-23.7 8.8-36.2 11zM369.1 359.1c-13.2-10.7-28.3-18.7-44.4-23.5-7.7-2.3-15.5-3.9-23.4-4.9 8.4-5.2 16.2-11.3 23.2-18.1 17.4-19.2 29.8-42.6 35.5-68.2 3.8-17.2 4.7-35.2 2.3-52.6-2.4-17.4-8-34.1-16.4-49.1-8.4-15-19.6-28.2-32.8-38.9-13.2-10.7-28.3-18.7-44.4-23.5-16.1-4.8-33-6.5-49.8-4.9-16.9 1.6-33.2 6.6-47.9 14.6l-2.4 1.3-2.4 1.3c-14.1 8.4-26.3 19.5-36 32.5-9.6 13-16.8 27.9-21.1 43.6-4.3 15.7-5.7 32.2-4 48.4 1.7 16.2 6.3 31.9 13.6 46.2 7.3 14.3 17.1 27 29 37.6 11.9 10.6 25.6 18.9 40.4 24.5 14.8 5.6 30.4 8.5 46.1 8.4h.2c6.5 0 13-.4 19.4-1.2-5.7 6.5-12.2 12.3-19.5 17.2-18.4 12.4-40.1 19.8-62.6 21.3-22.5 1.5-45.1-3-65.4-12.9-20.3-9.9-37.9-24.8-50.8-43.3-12.9-18.5-20.8-40.1-22.8-62.5-2-22.4 2-45.1 11.6-65.6 9.6-20.5 24.4-38.2 43-51.2 18.6-13 40.1-21.1 62.5-23.4 22.4-2.3 45.1 1.4 65.8 10.8 20.7 9.4 38.6 24 52 42.2 13.4 18.2 22.1 39.6 25 62 2.9 22.4-.1 45.2-8.9 66.1-8.8 20.9-22.9 39.3-41 53.2z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Pagamento via PIX</h1>
            <p className="text-white/80 mt-2">Pedido #{orderId}</p>
          </div>

          {/* Conteúdo */}
          <div className="p-6 space-y-6">
            {/* Valor */}
            <div className="text-center py-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Valor a pagar</p>
              <p className="text-4xl font-bold text-gray-900">
                R$ {pixData.amount.toFixed(2).replace('.', ',')}
              </p>
            </div>

            {/* Instruções */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-sm">1</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Abra o app do seu banco e escolha a opção <strong>PIX</strong>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Escolha pagar com <strong>Chave PIX</strong> e cole a chave abaixo
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Confirme o valor e o nome <strong>{pixData.name}</strong>
                </p>
              </div>
            </div>

            {/* Chave PIX */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Chave PIX (E-mail)</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono text-sm text-gray-800 break-all">
                  {pixData.key}
                </div>
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-3 rounded-lg flex items-center gap-2 transition font-medium ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Nome do beneficiário */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Verifique se o nome do beneficiário é <strong>{pixData.name}</strong> antes de confirmar o pagamento.
              </p>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Clock className="w-5 h-5" />
              <span className="text-sm">O PIX é processado instantaneamente</span>
            </div>

            {/* Aviso */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <p className="text-sm text-purple-800">
                Após o pagamento, você receberá a confirmação por <strong>e-mail</strong> e <strong>WhatsApp</strong> em até 24 horas.
              </p>
            </div>

            {/* Botão de Confirmação */}
            <button
              onClick={() => router.push(`/success?pix=true&order=${orderId}`)}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition shadow-lg"
            >
              Já fiz o pagamento
            </button>
          </div>
        </div>

        {/* Segurança */}
        <p className="text-center text-white/60 text-sm mt-6">
          🔒 Pagamento seguro via PIX
        </p>
      </div>
    </div>
  );
}
