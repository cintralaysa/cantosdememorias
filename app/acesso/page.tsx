'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Music, ArrowLeft, Search, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function AcessoPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/music/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Código não encontrado. Verifique e tente novamente.');
        setLoading(false);
        return;
      }

      // Redirecionar para a página da música
      router.push(`/musica/${data.orderId}`);
    } catch {
      setError('Erro ao buscar. Tente novamente.');
      setLoading(false);
    }
  };

  // Auto-format: adicionar "CANTOS-" se o usuário digitar só os 4 caracteres
  const handleCodeChange = (value: string) => {
    const upper = value.toUpperCase();
    setCode(upper);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0620] via-[#1a0f3a] to-[#0f0a1e]">
      {/* Header */}
      <header className="px-4 py-4 sm:py-6">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-white/60 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">
              Acessar minha música
            </h1>
            <p className="text-white/50 text-sm">Digite seu código de acesso</p>
          </div>
        </div>
      </header>

      <main className="px-4 pb-10">
        <div className="max-w-lg mx-auto">
          {/* Ícone */}
          <div className="text-center mb-8 mt-4">
            <div className="w-20 h-20 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-10 h-10 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Acesse sua música personalizada
            </h2>
            <p className="text-white/60 text-sm">
              Insira o código que você recebeu por e-mail para ouvir e baixar sua música.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Código de acesso
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="CANTOS-XXXX"
                  maxLength={11}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-4 text-white text-center text-xl font-mono tracking-widest placeholder:text-white/20 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                  autoFocus
                />
                {code && (
                  <button
                    type="button"
                    onClick={() => { setCode(''); setError(''); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-xl font-bold text-base hover:from-violet-400 hover:to-purple-500 transition shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Acessar minha música
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Music size={18} className="text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Onde encontro meu código?</p>
                <p className="text-white/50 text-xs leading-relaxed">
                  O código no formato <span className="font-mono text-violet-300">CANTOS-XXXX</span> foi enviado para o seu e-mail quando a música ficou pronta. Verifique sua caixa de entrada e spam.
                </p>
              </div>
            </div>
          </div>

          {/* Suporte */}
          <div className="mt-4 text-center">
            <p className="text-white/40 text-xs mb-2">Não encontrou seu código?</p>
            <a
              href="https://wa.me/5588992422920?text=Olá! Preciso de ajuda para acessar minha música."
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 text-sm font-medium transition"
            >
              Fale conosco no WhatsApp
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
