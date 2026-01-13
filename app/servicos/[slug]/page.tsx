import { SERVICES } from '@/lib/data';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import ViewContentTracker from '@/components/ViewContentTracker';
import { CheckCircle2, Music as MusicIcon, ChevronLeft, Star, Headphones, Shield, Clock, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = SERVICES.find(s => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  const isVoice = service.type === 'voiceover';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Meta Pixel: ViewContent */}
      <ViewContentTracker
        contentName={service.title}
        contentCategory={service.type === 'voiceover' ? 'Locução' : 'Música Personalizada'}
        value={service.price}
      />

      {/* Header simples - Mais compacto mobile */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-violet-500">
            <ChevronLeft size={16} />
            Voltar
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8 md:py-12">
        {/* Header do serviço - Mobile first */}
        <div className="text-center mb-4 md:hidden">
          <div className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 px-3 py-1.5 rounded-full mb-2">
            <Sparkles size={14} />
            <span className="text-xs font-bold">Compre 1, Ganhe Outra!</span>
          </div>
          <h1 className="text-xl font-black text-gray-900 mb-1">
            Música Personalizada
          </h1>
          <p className="text-gray-600 text-sm">
            2 melodias diferentes por apenas <span className="font-bold text-violet-600">R$ 79,99</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Coluna esquerda: Informações - Desktop */}
          <div className="lg:col-span-2 space-y-8 hidden md:block">
            {/* Badge e Título */}
            <div>
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full mb-6">
                <Sparkles size={16} />
                <span className="text-sm font-bold">{service.highlight}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                {service.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Preço destacado */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div>
                <p className="text-sm text-gray-500 mb-1">Valor único</p>
                <p className="text-4xl font-black text-gray-900">
                  R$ {service.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            {/* Áudio de demonstração */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                {isVoice ? <Headphones size={20} className="text-violet-500" /> : <MusicIcon size={20} className="text-violet-500" />}
                <span className="font-bold text-gray-900">Ouça um exemplo</span>
              </div>
              <audio controls className="w-full">
                <source src={service.audioSample || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} type="audio/mpeg" />
              </audio>
              <p className="mt-3 text-xs text-gray-400 text-center">
                Cada {isVoice ? 'mensagem' : 'música'} é única e personalizada para você
              </p>
            </div>

            {/* O que está incluso */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                O que está incluso
              </h3>
              <ul className="space-y-3">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={12} className="text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Garantias */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <Clock size={24} className="mx-auto text-violet-500 mb-2" />
                <p className="font-bold text-gray-900 text-sm">Entrega em 48h</p>
                <p className="text-xs text-gray-500">Dias úteis</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <Shield size={24} className="mx-auto text-violet-500 mb-2" />
                <p className="font-bold text-gray-900 text-sm">100% Seguro</p>
                <p className="text-xs text-gray-500">Pagamento protegido</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <Heart size={24} className="mx-auto text-violet-500 mb-2" />
                <p className="font-bold text-gray-900 text-sm">+2.000 clientes</p>
                <p className="text-xs text-gray-500">Satisfeitos</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <Star size={24} className="mx-auto text-violet-500 mb-2" />
                <p className="font-bold text-gray-900 text-sm">5.0 estrelas</p>
                <p className="text-xs text-gray-500">Avaliação</p>
              </div>
            </div>
          </div>

          {/* Coluna direita: Formulário */}
          <div className="lg:col-span-3">
            <BookingForm service={service} />

            {/* Info cards mobile */}
            <div className="mt-4 space-y-3 md:hidden">
              {/* Trust badges mobile - Grid 2x2 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-violet-50 rounded-xl p-3">
                  <Clock size={18} className="text-violet-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-800">Entrega 48h</p>
                    <p className="text-[10px] text-gray-500">Dias úteis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-violet-50 rounded-xl p-3">
                  <Shield size={18} className="text-violet-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-800">100% Seguro</p>
                    <p className="text-[10px] text-gray-500">Pagamento protegido</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-violet-50 rounded-xl p-3">
                  <Heart size={18} className="text-violet-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-800">+2.000 Clientes</p>
                    <p className="text-[10px] text-gray-500">Satisfeitos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-violet-50 rounded-xl p-3">
                  <Star size={18} className="text-violet-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-800">5.0 Estrelas</p>
                    <p className="text-[10px] text-gray-500">Avaliação</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
