import { SERVICES } from '@/lib/data';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { CheckCircle2, Music as MusicIcon, ChevronLeft, Star, Headphones, Shield, Clock, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ServicePage({ params }: { params: { slug: string } }) {
  const service = SERVICES.find(s => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  const isVoice = service.type === 'voiceover';

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-purple-50">
      {/* Header simples */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-violet-500 transition-all">
            <ChevronLeft size={18} />
            Voltar para início
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header do serviço - Mobile first */}
        <div className="text-center mb-8 md:hidden">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full mb-4">
            <Sparkles size={16} />
            <span className="text-sm font-bold">{service.highlight}</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            {service.title}
          </h1>
          <p className="text-gray-600">{service.description}</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Valor único</p>
                  <p className="text-4xl font-black text-gray-900">
                    R$ {service.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                    ✓ Sem taxas extras
                  </p>
                </div>
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
                <p className="font-bold text-gray-900 text-sm">Entrega em 24h</p>
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
            <div className="mt-8 space-y-4 md:hidden">
              {/* Áudio demo mobile */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  {isVoice ? <Headphones size={18} className="text-violet-500" /> : <MusicIcon size={18} className="text-violet-500" />}
                  <span className="font-bold text-gray-900 text-sm">Ouça um exemplo</span>
                </div>
                <audio controls className="w-full">
                  <source src={service.audioSample || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"} type="audio/mpeg" />
                </audio>
              </div>

              {/* Features mobile */}
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">O que está incluso:</h3>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust badges mobile */}
              <div className="flex justify-center gap-6 py-4">
                <div className="text-center">
                  <Clock size={20} className="mx-auto text-violet-500 mb-1" />
                  <p className="text-xs font-bold text-gray-700">24h</p>
                </div>
                <div className="text-center">
                  <Shield size={20} className="mx-auto text-violet-500 mb-1" />
                  <p className="text-xs font-bold text-gray-700">Seguro</p>
                </div>
                <div className="text-center">
                  <Heart size={20} className="mx-auto text-violet-500 mb-1" />
                  <p className="text-xs font-bold text-gray-700">+2.000</p>
                </div>
                <div className="text-center">
                  <Star size={20} className="mx-auto text-violet-500 mb-1" />
                  <p className="text-xs font-bold text-gray-700">5.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
