"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '@/lib/data';
import { ArrowRight, ArrowLeft, Loader2, Heart, Music, Sparkles, Check, Shield, Clock, RefreshCw, Edit3, X, User, Phone, Mail, Mic2, CheckCircle, Zap } from 'lucide-react';

// Relacionamentos - os mais populares primeiro
const RELATIONSHIPS = [
  { value: 'mae', label: 'Mãe', emoji: '👩' },
  { value: 'pai', label: 'Pai', emoji: '👨' },
  { value: 'esposo', label: 'Esposo(a)', emoji: '💑' },
  { value: 'filho', label: 'Filho(a)', emoji: '👶' },
  { value: 'namorado', label: 'Namorado(a)', emoji: '💕' },
  { value: 'cha-revelacao', label: 'Chá Revelação', emoji: '🎀' },
  { value: 'avo', label: 'Avô/Avó', emoji: '👴' },
  { value: 'amigo', label: 'Amigo(a)', emoji: '🤝' },
];

// Ocasiões simplificadas
const OCCASIONS = [
  { value: 'aniversario', label: 'Aniversário', emoji: '🎂' },
  { value: 'declaracao', label: 'Declaração de Amor', emoji: '💌' },
  { value: 'casamento', label: 'Casamento', emoji: '💒' },
  { value: 'cha-revelacao', label: 'Chá Revelação', emoji: '👶' },
  { value: 'homenagem', label: 'Homenagem', emoji: '🏆' },
  { value: 'datas', label: 'Datas Especiais', emoji: '🎁' },
];

// Estilos musicais - apenas os 8 mais populares
const MUSIC_STYLES = [
  { value: 'romantico', label: 'Romântico', emoji: '💕' },
  { value: 'sertanejo', label: 'Sertanejo', emoji: '🤠' },
  { value: 'mpb', label: 'MPB', emoji: '🎸' },
  { value: 'pop', label: 'Pop', emoji: '🎤' },
  { value: 'gospel', label: 'Gospel', emoji: '🙏' },
  { value: 'forro', label: 'Forró', emoji: '🪗' },
  { value: 'pagode', label: 'Pagode', emoji: '🥁' },
  { value: 'infantil', label: 'Infantil', emoji: '🧸' },
];

interface FormData {
  // Contato (Passo 1)
  userName: string;
  whatsapp: string;
  email: string;
  // Detalhes (Passo 2)
  relationship: string;
  honoreeName: string;
  occasion: string;
  musicStyle: string;
  voicePreference: string;
  storyAndMessage: string;
  // Chá Revelação
  knowsBabySex: string;
  babySex: string;
  babyNameBoy: string;
  babyNameGirl: string;
  // Letra (Passo 3)
  generatedLyrics: string;
  lyricsApproved: boolean;
}

interface SimpleBookingFormProps {
  service: Service;
  onClose?: () => void;
  isModal?: boolean;
}

export default function SimpleBookingForm({ service, onClose, isModal = false }: SimpleBookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    userName: '',
    whatsapp: '',
    email: '',
    relationship: '',
    honoreeName: '',
    occasion: '',
    musicStyle: '',
    voicePreference: 'sem_preferencia',
    storyAndMessage: '',
    knowsBabySex: '',
    babySex: '',
    babyNameBoy: '',
    babyNameGirl: '',
    generatedLyrics: '',
    lyricsApproved: false,
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: // Contato
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return formData.userName.trim().length >= 2 &&
               formData.whatsapp.replace(/\D/g, '').length >= 10 &&
               emailRegex.test(formData.email.trim());
      case 2: // Detalhes
        if (formData.relationship === 'cha-revelacao') {
          if (!formData.knowsBabySex) return false;
          if (formData.knowsBabySex === 'sim' && !formData.babySex) return false;
          if (formData.knowsBabySex === 'sim' && formData.babySex === 'menino' && !formData.babyNameBoy.trim()) return false;
          if (formData.knowsBabySex === 'sim' && formData.babySex === 'menina' && !formData.babyNameGirl.trim()) return false;
          if (formData.knowsBabySex === 'nao' && (!formData.babyNameBoy.trim() || !formData.babyNameGirl.trim())) return false;
          return formData.honoreeName.trim().length >= 2 &&
                 formData.musicStyle &&
                 formData.storyAndMessage.trim().length >= 10;
        }
        return formData.relationship &&
               formData.honoreeName.trim().length >= 2 &&
               formData.occasion &&
               formData.musicStyle &&
               formData.storyAndMessage.trim().length >= 10;
      case 3: // Letra e pagamento
        return formData.lyricsApproved && formData.generatedLyrics.trim().length > 0;
      default:
        return false;
    }
  };

  const generateLyrics = async () => {
    setGeneratingLyrics(true);
    setLyricsError('');
    try {
      const response = await fetch('/api/generate-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationship: formData.relationship,
          relationshipLabel: RELATIONSHIPS.find(r => r.value === formData.relationship)?.label || formData.relationship,
          honoreeName: formData.honoreeName,
          occasion: formData.occasion,
          occasionLabel: OCCASIONS.find(o => o.value === formData.occasion)?.label || formData.occasion,
          musicStyle: formData.musicStyle,
          musicStyleLabel: MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label || formData.musicStyle,
          voicePreference: formData.voicePreference,
          qualities: formData.storyAndMessage,
          memories: formData.storyAndMessage,
          heartMessage: formData.storyAndMessage,
          knowsBabySex: formData.knowsBabySex,
          babySex: formData.babySex,
          babyNameBoy: formData.babyNameBoy,
          babyNameGirl: formData.babyNameGirl,
        }),
      });
      const data = await response.json();
      if (data.error) {
        setLyricsError(data.error);
      } else if (data.lyrics) {
        updateField('generatedLyrics', data.lyrics);
        updateField('lyricsApproved', false);
      }
    } catch (error) {
      setLyricsError('Erro ao gerar letra. Tente novamente.');
    } finally {
      setGeneratingLyrics(false);
    }
  };

  const nextStep = async () => {
    if (step < totalSteps && canProceed()) {
      if (step === 2 && !formData.generatedLyrics) {
        await generateLyrics();
      }
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Formatar WhatsApp automaticamente
  const formatWhatsapp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Redirecionar para checkout PIX
  const handlePixCheckout = async () => {
    if (!canProceed()) return;
    setLoading(true);
    setPaymentError(null);

    try {
      const orderData = {
        customerName: formData.userName,
        customerEmail: formData.email,
        customerWhatsapp: formData.whatsapp,
        honoreeName: formData.honoreeName,
        relationship: formData.relationship,
        relationshipLabel: RELATIONSHIPS.find(r => r.value === formData.relationship)?.label,
        occasion: formData.occasion,
        occasionLabel: OCCASIONS.find(o => o.value === formData.occasion)?.label,
        musicStyle: formData.musicStyle,
        musicStyleLabel: MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label,
        voicePreference: formData.voicePreference,
        storyAndMessage: formData.storyAndMessage,
        generatedLyrics: formData.generatedLyrics,
        knowsBabySex: formData.knowsBabySex,
        babySex: formData.babySex,
        babyNameBoy: formData.babyNameBoy,
        babyNameGirl: formData.babyNameGirl,
      };

      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      router.push('/checkout/pix');
    } catch (error: any) {
      setPaymentError(error.message || 'Erro ao processar. Tente novamente.');
      setLoading(false);
    }
  };

  const stepInfo = [
    { title: 'Seus dados', desc: 'Para enviarmos sua música' },
    { title: 'Detalhes', desc: 'Sobre a pessoa especial' },
    { title: 'Finalizar', desc: 'Aprovar letra e pagar' },
  ];

  return (
    <div className={`bg-white ${isModal ? 'rounded-2xl max-h-[90vh] overflow-hidden flex flex-col' : 'rounded-2xl shadow-xl'}`}>
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="text-white">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">{step}/{totalSteps}</span>
              <h3 className="text-base font-bold">{stepInfo[step - 1].title}</h3>
            </div>
            <p className="text-white/70 text-xs">{stepInfo[step - 1].desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/10 rounded-lg px-3 py-1.5 text-right">
              <span className="text-lg font-black text-white">R$ {service.price.toFixed(2).replace('.', ',')}</span>
            </div>
            {isModal && onClose && (
              <button onClick={onClose} className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            )}
          </div>
        </div>
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Conteúdo */}
      <div className={`p-4 ${isModal ? 'overflow-y-auto flex-1' : ''}`}>

        {/* PASSO 1 - CONTATO */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeInUp">
            {/* Benefícios rápidos */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200">
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <Zap size={16} className="text-green-500" />
                <span className="font-medium">Música pronta em até 48h no seu WhatsApp</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-1.5">
                  <User size={14} className="text-violet-500" />Seu nome
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => updateField('userName', e.target.value)}
                  placeholder="Como você se chama?"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:outline-none text-base transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-1.5">
                  <Phone size={14} className="text-violet-500" />WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => updateField('whatsapp', formatWhatsapp(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:outline-none text-base transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-1.5">
                  <Mail size={14} className="text-violet-500" />E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:outline-none text-base transition-colors"
                />
              </div>
            </div>

            {/* Social proof */}
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 pt-2">
              <div className="flex -space-x-2">
                {['bg-pink-400', 'bg-violet-400', 'bg-blue-400', 'bg-green-400'].map((bg, i) => (
                  <div key={i} className={`w-6 h-6 ${bg} rounded-full border-2 border-white`}></div>
                ))}
              </div>
              <span className="ml-2">+6.000 músicas criadas</span>
            </div>
          </div>
        )}

        {/* PASSO 2 - DETALHES */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeInUp">
            {/* Para quem */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                <Heart size={14} className="text-violet-500" />Para quem é a música?
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {RELATIONSHIPS.map((rel) => (
                  <button
                    key={rel.value}
                    type="button"
                    onClick={() => {
                      updateField('relationship', rel.value);
                      if (rel.value === 'cha-revelacao') updateField('occasion', 'cha-revelacao');
                      else if (formData.occasion === 'cha-revelacao') updateField('occasion', '');
                    }}
                    className={`p-2 rounded-xl border-2 text-center transition-all active:scale-95 ${
                      formData.relationship === rel.value
                        ? 'border-violet-500 bg-violet-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg block">{rel.emoji}</span>
                    <span className={`font-medium text-[9px] block ${formData.relationship === rel.value ? 'text-violet-600' : 'text-gray-600'}`}>
                      {rel.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chá Revelação - campos especiais */}
            {formData.relationship === 'cha-revelacao' && (
              <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl p-3 border border-pink-200 space-y-3">
                <div className="text-center">
                  <span className="text-2xl">👶</span>
                  <h3 className="text-sm font-bold text-gray-900">Detalhes do Chá Revelação</h3>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Você já sabe o sexo?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { updateField('knowsBabySex', 'sim'); updateField('babySex', ''); }}
                      className={`p-2.5 rounded-xl border-2 text-center ${formData.knowsBabySex === 'sim' ? 'border-pink-500 bg-pink-100' : 'border-gray-200'}`}
                    >
                      <span className="text-base block">✅</span>
                      <span className="font-bold text-xs">Sim!</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { updateField('knowsBabySex', 'nao'); updateField('babySex', ''); }}
                      className={`p-2.5 rounded-xl border-2 text-center ${formData.knowsBabySex === 'nao' ? 'border-violet-500 bg-violet-100' : 'border-gray-200'}`}
                    >
                      <span className="text-base block">🎁</span>
                      <span className="font-bold text-xs">Surpresa!</span>
                    </button>
                  </div>
                </div>
                {formData.knowsBabySex === 'sim' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { updateField('babySex', 'menino'); updateField('babyNameGirl', ''); }}
                        className={`p-2 rounded-xl border-2 ${formData.babySex === 'menino' ? 'border-blue-500 bg-blue-100' : 'border-gray-200'}`}
                      >
                        <span className="text-lg">💙</span>
                        <span className="font-bold text-xs block">Menino</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { updateField('babySex', 'menina'); updateField('babyNameBoy', ''); }}
                        className={`p-2 rounded-xl border-2 ${formData.babySex === 'menina' ? 'border-pink-500 bg-pink-100' : 'border-gray-200'}`}
                      >
                        <span className="text-lg">💖</span>
                        <span className="font-bold text-xs block">Menina</span>
                      </button>
                    </div>
                    {formData.babySex && (
                      <input
                        type="text"
                        value={formData.babySex === 'menino' ? formData.babyNameBoy : formData.babyNameGirl}
                        onChange={(e) => updateField(formData.babySex === 'menino' ? 'babyNameBoy' : 'babyNameGirl', e.target.value)}
                        placeholder="Nome do bebê"
                        className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-violet-500 text-sm"
                      />
                    )}
                  </div>
                )}
                {formData.knowsBabySex === 'nao' && (
                  <div className="space-y-2">
                    <p className="text-xs text-violet-700 bg-violet-100 p-2 rounded-lg text-center">Música com suspense e dois finais!</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.babyNameBoy}
                        onChange={(e) => updateField('babyNameBoy', e.target.value)}
                        placeholder="💙 Nome menino"
                        className="px-3 py-2 rounded-xl border-2 border-blue-200 text-sm"
                      />
                      <input
                        type="text"
                        value={formData.babyNameGirl}
                        onChange={(e) => updateField('babyNameGirl', e.target.value)}
                        placeholder="💖 Nome menina"
                        className="px-3 py-2 rounded-xl border-2 border-pink-200 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nome do homenageado */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-1.5">
                <User size={14} className="text-violet-500" />
                {formData.relationship === 'cha-revelacao' ? 'Nome dos pais' : 'Nome da pessoa'}
              </label>
              <input
                type="text"
                value={formData.honoreeName}
                onChange={(e) => updateField('honoreeName', e.target.value)}
                placeholder={formData.relationship === 'cha-revelacao' ? 'Ex: Maria e João' : 'Ex: Maria'}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 text-base"
              />
            </div>

            {/* Ocasião (se não for chá revelação) */}
            {formData.relationship !== 'cha-revelacao' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                  <Sparkles size={14} className="text-violet-500" />Ocasião
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {OCCASIONS.filter(o => o.value !== 'cha-revelacao').map((occ) => (
                    <button
                      key={occ.value}
                      type="button"
                      onClick={() => updateField('occasion', occ.value)}
                      className={`p-2 rounded-xl border-2 text-center active:scale-95 ${
                        formData.occasion === occ.value
                          ? 'border-violet-500 bg-violet-50 shadow-md'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-base block">{occ.emoji}</span>
                      <span className={`font-medium text-[9px] block ${formData.occasion === occ.value ? 'text-violet-600' : 'text-gray-600'}`}>
                        {occ.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Estilo musical */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                <Music size={14} className="text-violet-500" />Estilo musical
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {MUSIC_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateField('musicStyle', style.value)}
                    className={`p-2 rounded-xl border-2 text-center active:scale-95 ${
                      formData.musicStyle === style.value
                        ? 'border-violet-500 bg-violet-50 shadow-md'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="text-base block">{style.emoji}</span>
                    <span className={`font-medium text-[9px] block ${formData.musicStyle === style.value ? 'text-violet-600' : 'text-gray-600'}`}>
                      {style.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voz */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                <Mic2 size={14} className="text-violet-500" />Voz
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateField('voicePreference', 'feminina')}
                  className={`p-2 rounded-xl border-2 text-center ${formData.voicePreference === 'feminina' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}`}
                >
                  <span className="text-lg block">👩‍🎤</span>
                  <span className="font-medium text-xs">Feminina</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('voicePreference', 'masculina')}
                  className={`p-2 rounded-xl border-2 text-center ${formData.voicePreference === 'masculina' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <span className="text-lg block">👨‍🎤</span>
                  <span className="font-medium text-xs">Masculina</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('voicePreference', 'sem_preferencia')}
                  className={`p-2 rounded-xl border-2 text-center ${formData.voicePreference === 'sem_preferencia' ? 'border-violet-500 bg-violet-50' : 'border-gray-200'}`}
                >
                  <span className="text-lg block">🎵</span>
                  <span className="font-medium text-xs">Tanto faz</span>
                </button>
              </div>
            </div>

            {/* História */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-1.5">
                <Heart size={14} className="text-violet-500 fill-violet-500" />
                Conte sobre {formData.honoreeName || 'essa pessoa'}
              </label>
              <textarea
                value={formData.storyAndMessage}
                onChange={(e) => updateField('storyAndMessage', e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Qualidades, memórias especiais, o que você quer dizer..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 resize-none text-sm"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">Mínimo 10 caracteres</span>
                <span className={`text-xs ${formData.storyAndMessage.length < 10 ? 'text-red-500' : 'text-green-500'}`}>
                  {formData.storyAndMessage.length}/500
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 3 - LETRA E PAGAMENTO */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeInUp">
            {generatingLyrics ? (
              <div className="text-center py-8">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <Music className="text-violet-500 animate-bounce" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Criando a letra...</h3>
                <p className="text-violet-600 text-sm">Nossa IA está compondo versos únicos para {formData.honoreeName}</p>
                <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="animate-spin" size={16} />
                  <span>Aguarde alguns segundos</span>
                </div>
              </div>
            ) : lyricsError ? (
              <div className="text-center py-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-red-600 text-sm">{lyricsError}</p>
                </div>
                <button
                  type="button"
                  onClick={generateLyrics}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-violet-500 text-white rounded-lg font-bold text-sm"
                >
                  <RefreshCw size={16} />Tentar Novamente
                </button>
              </div>
            ) : formData.generatedLyrics ? (
              <>
                {/* Letra gerada */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-3 border border-violet-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Music size={16} className="text-violet-500" />
                      <span className="font-bold text-gray-900 text-sm">Letra para {formData.honoreeName}</span>
                    </div>
                    <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">
                      {MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-3 max-h-[180px] overflow-y-auto shadow-inner">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
                      {formData.generatedLyrics}
                    </pre>
                  </div>
                </div>

                {/* Ações da letra */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={generateLyrics}
                    disabled={generatingLyrics}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-violet-300 text-violet-600 rounded-xl font-bold text-sm"
                  >
                    <RefreshCw size={14} />Nova versão
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('lyricsApproved', true)}
                    disabled={formData.lyricsApproved}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm ${
                      formData.lyricsApproved
                        ? 'bg-green-500 text-white'
                        : 'bg-violet-500 text-white hover:bg-violet-600'
                    }`}
                  >
                    <Check size={14} />
                    {formData.lyricsApproved ? 'Aprovada!' : 'Aprovar letra'}
                  </button>
                </div>

                {/* Editar manualmente */}
                <details className="border border-gray-200 rounded-xl overflow-hidden">
                  <summary className="px-3 py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 flex items-center gap-2">
                    <Edit3 size={12} />Editar manualmente
                  </summary>
                  <div className="p-3 pt-0 border-t">
                    <textarea
                      value={formData.generatedLyrics}
                      onChange={(e) => {
                        updateField('generatedLyrics', e.target.value);
                        updateField('lyricsApproved', false);
                      }}
                      rows={8}
                      className="w-full px-3 py-2 rounded-lg border text-sm font-mono resize-none"
                    />
                  </div>
                </details>

                {/* Pagamento */}
                {formData.lyricsApproved && (
                  <div className="space-y-3 pt-2">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                        <CheckCircle size={16} className="text-green-500" />
                        Letra aprovada! Finalize o pagamento.
                      </div>
                    </div>

                    {/* Resumo */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Música para {formData.honoreeName}</span>
                        <span className="text-xl font-black text-violet-600">R$ {service.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    {paymentError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        {paymentError}
                      </div>
                    )}

                    {/* Botão PIX */}
                    <button
                      type="button"
                      onClick={handlePixCheckout}
                      disabled={loading}
                      className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg transition-all"
                    >
                      {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Processando...</>
                      ) : (
                        <>
                          <svg viewBox="0 0 512 512" className="w-6 h-6 fill-current">
                            <path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z"/>
                          </svg>
                          Pagar com PIX
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />Instantâneo
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />Seguro
                      </div>
                      <div className="flex items-center gap-1">
                        <Check size={12} className="text-green-500" />Sem sair do site
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-violet-500" size={28} />
                </div>
                <p className="text-gray-600 mb-4">Clique para gerar sua letra</p>
                <button
                  type="button"
                  onClick={generateLyrics}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-xl font-bold"
                >
                  <Sparkles size={18} />Gerar Letra
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navegação */}
        <div className="flex gap-3 pt-5">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 text-sm hover:bg-gray-50"
            >
              <ArrowLeft size={16} />Voltar
            </button>
          )}
          {step < totalSteps && (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed() || generatingLyrics}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                canProceed() && !generatingLyrics
                  ? 'bg-violet-600 text-white hover:bg-violet-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {generatingLyrics ? (
                <><Loader2 className="animate-spin" size={16} />Gerando...</>
              ) : (
                <>Continuar<ArrowRight size={16} /></>
              )}
            </button>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 pt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Shield size={12} className="text-green-500" /><span>Seguro</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-violet-500" /><span>Entrega 48h</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={12} className="text-red-400" /><span>+6.000 clientes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
