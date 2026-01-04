"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '@/lib/data';
import { ArrowRight, ArrowLeft, Loader2, Lock, Heart, Music, Sparkles, Check, Shield, Clock, FileText, RefreshCw, Edit3, X, User, Phone, Mail, Users, Mic2 } from 'lucide-react';

// Opções de relacionamento - Chá Revelação primeiro!
const RELATIONSHIPS = [
  { value: 'cha-revelacao', label: 'Chá Revelação', emoji: '🎀' },
  { value: 'mae', label: 'Mãe', emoji: '👩' },
  { value: 'pai', label: 'Pai', emoji: '👨' },
  { value: 'filho', label: 'Filho(a)', emoji: '👶' },
  { value: 'esposo', label: 'Esposo(a)', emoji: '💑' },
  { value: 'namorado', label: 'Namorado(a)', emoji: '💕' },
  { value: 'avo', label: 'Avô/Avó', emoji: '👴' },
  { value: 'irmao', label: 'Irmão(ã)', emoji: '👫' },
  { value: 'amigo', label: 'Amigo(a)', emoji: '🤝' },
  { value: 'outro', label: 'Outro', emoji: '✨' },
];

// Ocasiões
const OCCASIONS = [
  { value: 'aniversario', label: 'Aniversário', emoji: '🎂' },
  { value: 'casamento', label: 'Casamento', emoji: '💒' },
  { value: 'cha-revelacao', label: 'Chá Revelação', emoji: '👶' },
  { value: 'namoro', label: 'Dia dos Namorados', emoji: '💝' },
  { value: 'maes', label: 'Dia das Mães', emoji: '🌸' },
  { value: 'pais', label: 'Dia dos Pais', emoji: '👔' },
  { value: 'formatura', label: 'Formatura', emoji: '🎓' },
  { value: 'homenagem', label: 'Homenagem', emoji: '🏆' },
  { value: 'declaracao', label: 'Declaração', emoji: '💌' },
  { value: 'outro', label: 'Outro', emoji: '🌟' },
];

// Estilos musicais - EXPANDIDO
const MUSIC_STYLES = [
  { value: 'romantico', label: 'Romântico', emoji: '💕' },
  { value: 'sertanejo', label: 'Sertanejo', emoji: '🤠' },
  { value: 'mpb', label: 'MPB', emoji: '🎸' },
  { value: 'pop', label: 'Pop', emoji: '🎤' },
  { value: 'gospel', label: 'Gospel', emoji: '🙏' },
  { value: 'forro', label: 'Forró', emoji: '🪗' },
  { value: 'pagode', label: 'Pagode', emoji: '🥁' },
  { value: 'samba', label: 'Samba', emoji: '💃' },
  { value: 'rock', label: 'Rock', emoji: '🎸' },
  { value: 'bossa-nova', label: 'Bossa Nova', emoji: '🎹' },
  { value: 'reggae', label: 'Reggae', emoji: '🌴' },
  { value: 'infantil', label: 'Infantil', emoji: '🧸' },
  { value: 'classico', label: 'Clássico', emoji: '🎻' },
  { value: 'funk-melody', label: 'Funk Melody', emoji: '🎧' },
  { value: 'eletronico', label: 'Eletrônico', emoji: '🎹' },
];

interface FormData {
  relationship: string;
  honoreeName: string;
  occasion: string;
  musicStyle: string;
  voicePreference: string;
  storyAndMessage: string;
  familyNames: string;
  userName: string;
  whatsapp: string;
  email: string;
  knowsBabySex: string;
  babySex: string;
  babyNameBoy: string;
  babyNameGirl: string;
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
  const [formData, setFormData] = useState<FormData>({
    relationship: '',
    honoreeName: '',
    occasion: '',
    musicStyle: '',
    voicePreference: 'sem_preferencia',
    storyAndMessage: '',
    familyNames: '',
    userName: '',
    whatsapp: '',
    email: '',
    knowsBabySex: '',
    babySex: '',
    babyNameBoy: '',
    babyNameGirl: '',
    generatedLyrics: '',
    lyricsApproved: false,
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        if (formData.relationship === 'cha-revelacao') {
          if (!formData.knowsBabySex) return false;
          if (formData.knowsBabySex === 'sim' && !formData.babySex) return false;
          if (formData.knowsBabySex === 'sim' && formData.babySex === 'menino' && !formData.babyNameBoy.trim()) return false;
          if (formData.knowsBabySex === 'sim' && formData.babySex === 'menina' && !formData.babyNameGirl.trim()) return false;
          if (formData.knowsBabySex === 'nao' && (!formData.babyNameBoy.trim() || !formData.babyNameGirl.trim())) return false;
          return formData.honoreeName.trim().length >= 2 && formData.musicStyle;
        }
        return formData.relationship &&
               formData.honoreeName.trim().length >= 2 &&
               formData.occasion &&
               formData.musicStyle;
      case 2:
        return formData.storyAndMessage.trim().length >= 20;
      case 3:
        return formData.lyricsApproved && formData.generatedLyrics.trim().length > 0;
      case 4:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return formData.userName.trim().length >= 2 &&
               formData.whatsapp.trim().length >= 10 &&
               emailRegex.test(formData.email.trim());
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
          familyNames: formData.familyNames,
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
      console.error('Error generating lyrics:', error);
      setLyricsError('Erro ao gerar letra. Por favor, tente novamente.');
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
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCheckout = async () => {
    if (!canProceed()) return;
    setLoading(true);

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const checkoutData = {
      orderId,
      amount: service.price,
      customerName: formData.userName,
      customerEmail: formData.email,
      customerWhatsapp: formData.whatsapp,
      honoreeName: formData.honoreeName,
      relationship: formData.relationship,
      relationshipLabel: RELATIONSHIPS.find(r => r.value === formData.relationship)?.label || formData.relationship,
      occasion: formData.occasion,
      occasionLabel: OCCASIONS.find(o => o.value === formData.occasion)?.label || formData.occasion,
      musicStyle: formData.musicStyle,
      musicStyleLabel: MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label || formData.musicStyle,
      voicePreference: formData.voicePreference,
      qualities: formData.storyAndMessage,
      memories: formData.storyAndMessage,
      heartMessage: formData.storyAndMessage,
      familyNames: formData.familyNames,
      approvedLyrics: formData.generatedLyrics,
      knowsBabySex: formData.knowsBabySex,
      babySex: formData.babySex,
      babyNameBoy: formData.babyNameBoy,
      babyNameGirl: formData.babyNameGirl,
    };

    try {
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      if (onClose) onClose();
      router.push('/checkout');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erro ao processar pedido. Tente novamente.');
      setLoading(false);
    }
  };

  const stepInfo = [
    { title: 'Informações', desc: 'Para quem é a música?' },
    { title: 'Sua História', desc: 'Conte sobre essa pessoa especial' },
    { title: 'Sua Letra', desc: 'Veja e aprove a letra criada' },
    { title: 'Finalizar', desc: 'Seus dados para entrega' },
  ];

  return (
    <div className={`bg-white ${isModal ? 'rounded-2xl max-h-[90vh] overflow-hidden flex flex-col' : 'rounded-2xl sm:rounded-3xl shadow-xl'}`}>
      {/* Header com preço fixo e progresso */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
                Passo {step} de {totalSteps}
              </span>
            </div>
            <h3 className="text-lg font-bold">{stepInfo[step - 1].title}</h3>
            <p className="text-white/70 text-xs">{stepInfo[step - 1].desc}</p>
          </div>
          <div className="text-right flex items-center gap-3">
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <span className="text-xs text-white/60 block">Apenas</span>
              <span className="text-xl font-black text-white">R$ 79,99</span>
            </div>
            {isModal && onClose && (
              <button onClick={onClose} className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={24} />
              </button>
            )}
          </div>
        </div>
        {/* Barra de progresso */}
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Conteúdo do formulário */}
      <div className={`p-4 sm:p-6 ${isModal ? 'overflow-y-auto flex-1' : ''}`}>

        {/* ===== PASSO 1 - Informações básicas ===== */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeInUp">

            {/* Para quem é a música */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Heart size={16} className="text-violet-500" />
                Para quem é essa música?
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {RELATIONSHIPS.map((rel) => (
                  <button
                    key={rel.value}
                    type="button"
                    onClick={() => {
                      updateField('relationship', rel.value);
                      if (rel.value === 'cha-revelacao') {
                        updateField('occasion', 'cha-revelacao');
                      } else if (formData.occasion === 'cha-revelacao') {
                        updateField('occasion', '');
                      }
                    }}
                    className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all active:scale-95 sm:hover:scale-105 ${
                      formData.relationship === rel.value
                        ? 'border-violet-500 bg-violet-50 shadow-md'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <span className="text-lg sm:text-xl block">{rel.emoji}</span>
                    <span className={`font-medium text-[9px] sm:text-[10px] leading-tight block mt-1 ${formData.relationship === rel.value ? 'text-violet-600' : 'text-gray-600'}`}>
                      {rel.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Campos de Chá Revelação */}
            {formData.relationship === 'cha-revelacao' && (
              <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl p-4 border border-pink-200 space-y-4 animate-fadeInUp">
                <div className="text-center">
                  <span className="text-3xl">👶</span>
                  <h3 className="text-sm font-bold text-gray-900 mt-1">Detalhes do Chá Revelação</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Você já sabe o sexo do bebê?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => { updateField('knowsBabySex', 'sim'); updateField('babySex', ''); }}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${formData.knowsBabySex === 'sim' ? 'border-pink-500 bg-pink-100' : 'border-gray-200 hover:border-pink-300'}`}
                    >
                      <span className="text-lg block">✅</span>
                      <span className="font-bold text-xs">Sim, já sei!</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { updateField('knowsBabySex', 'nao'); updateField('babySex', ''); }}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${formData.knowsBabySex === 'nao' ? 'border-violet-500 bg-violet-100' : 'border-gray-200 hover:border-violet-300'}`}
                    >
                      <span className="text-lg block">🎁</span>
                      <span className="font-bold text-xs">É surpresa!</span>
                    </button>
                  </div>
                </div>

                {formData.knowsBabySex === 'sim' && (
                  <div className="space-y-3 animate-fadeInUp">
                    <label className="block text-xs font-bold text-gray-700">Qual o sexo?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { updateField('babySex', 'menino'); updateField('babyNameGirl', ''); }}
                        className={`p-3 rounded-xl border-2 ${formData.babySex === 'menino' ? 'border-blue-500 bg-blue-100' : 'border-gray-200 hover:border-blue-300'}`}
                      >
                        <span className="text-xl">💙</span>
                        <span className="font-bold text-xs block">Menino</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { updateField('babySex', 'menina'); updateField('babyNameBoy', ''); }}
                        className={`p-3 rounded-xl border-2 ${formData.babySex === 'menina' ? 'border-pink-500 bg-pink-100' : 'border-gray-200 hover:border-pink-300'}`}
                      >
                        <span className="text-xl">💖</span>
                        <span className="font-bold text-xs block">Menina</span>
                      </button>
                    </div>
                    {formData.babySex && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Nome do bebê
                        </label>
                        <input
                          type="text"
                          value={formData.babySex === 'menino' ? formData.babyNameBoy : formData.babyNameGirl}
                          onChange={(e) => updateField(formData.babySex === 'menino' ? 'babyNameBoy' : 'babyNameGirl', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-0 text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

                {formData.knowsBabySex === 'nao' && (
                  <div className="space-y-3 animate-fadeInUp">
                    <p className="text-xs text-violet-700 bg-violet-100 p-2 rounded-lg">
                      Criaremos uma música com suspense e dois finais!
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-blue-600 mb-1">💙 Se for menino</label>
                        <input
                          type="text"
                          value={formData.babyNameBoy}
                          onChange={(e) => updateField('babyNameBoy', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border-2 border-blue-200 focus:border-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-pink-600 mb-1">💖 Se for menina</label>
                        <input
                          type="text"
                          value={formData.babyNameGirl}
                          onChange={(e) => updateField('babyNameGirl', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border-2 border-pink-200 focus:border-pink-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nome da pessoa */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <User size={16} className="text-violet-500" />
                {formData.relationship === 'cha-revelacao' ? 'Nome dos pais' : 'Nome da pessoa homenageada'}
              </label>
              <input
                type="text"
                value={formData.honoreeName}
                onChange={(e) => updateField('honoreeName', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-0 text-base"
              />
              <p className="text-xs text-gray-400">
                {formData.relationship === 'cha-revelacao'
                  ? 'Ex: Ana e Pedro, Família Silva'
                  : 'Ex: Maria, João, Vovó Ana'}
              </p>
            </div>

            {/* Ocasião (se não for chá revelação) */}
            {formData.relationship !== 'cha-revelacao' && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <Sparkles size={16} className="text-violet-500" />
                  Qual a ocasião especial?
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {OCCASIONS.filter(o => o.value !== 'cha-revelacao').map((occ) => (
                    <button
                      key={occ.value}
                      type="button"
                      onClick={() => updateField('occasion', occ.value)}
                      className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all active:scale-95 sm:hover:scale-105 ${
                        formData.occasion === occ.value
                          ? 'border-violet-500 bg-violet-50 shadow-md'
                          : 'border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      <span className="text-lg sm:text-xl block">{occ.emoji}</span>
                      <span className={`font-medium text-[9px] sm:text-[10px] leading-tight block mt-1 ${formData.occasion === occ.value ? 'text-violet-600' : 'text-gray-600'}`}>
                        {occ.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Estilo musical - EXPANDIDO */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Music size={16} className="text-violet-500" />
                Qual estilo musical você prefere?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {MUSIC_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateField('musicStyle', style.value)}
                    className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all active:scale-95 sm:hover:scale-105 ${
                      formData.musicStyle === style.value
                        ? 'border-violet-500 bg-violet-50 shadow-md'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <span className="text-lg sm:text-xl block">{style.emoji}</span>
                    <span className={`font-medium text-[9px] sm:text-[10px] leading-tight block mt-1 ${formData.musicStyle === style.value ? 'text-violet-600' : 'text-gray-600'}`}>
                      {style.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferência de Voz */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Mic2 size={16} className="text-violet-500" />
                Qual voz você prefere?
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => updateField('voicePreference', 'feminina')}
                  className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all active:scale-95 sm:hover:scale-105 ${
                    formData.voicePreference === 'feminina'
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <span className="text-xl sm:text-2xl block">👩‍🎤</span>
                  <span className={`font-bold text-xs sm:text-sm block mt-1 ${formData.voicePreference === 'feminina' ? 'text-pink-600' : 'text-gray-600'}`}>
                    Feminina
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('voicePreference', 'masculina')}
                  className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all active:scale-95 sm:hover:scale-105 ${
                    formData.voicePreference === 'masculina'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="text-xl sm:text-2xl block">👨‍🎤</span>
                  <span className={`font-bold text-xs sm:text-sm block mt-1 ${formData.voicePreference === 'masculina' ? 'text-blue-600' : 'text-gray-600'}`}>
                    Masculina
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('voicePreference', 'sem_preferencia')}
                  className={`p-2 sm:p-3 rounded-xl border-2 text-center transition-all active:scale-95 sm:hover:scale-105 ${
                    formData.voicePreference === 'sem_preferencia'
                      ? 'border-violet-500 bg-violet-50 shadow-md'
                      : 'border-gray-200 hover:border-violet-300'
                  }`}
                >
                  <span className="text-xl sm:text-2xl block">🎵</span>
                  <span className={`font-bold text-xs sm:text-sm block mt-1 ${formData.voicePreference === 'sem_preferencia' ? 'text-violet-600' : 'text-gray-600'}`}>
                    Tanto faz
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== PASSO 2 - História ===== */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeInUp">
            {/* Resumo do passo anterior */}
            <div className="bg-violet-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center text-white text-lg">
                {RELATIONSHIPS.find(r => r.value === formData.relationship)?.emoji}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{formData.honoreeName}</p>
                <p className="text-xs text-gray-500">
                  {OCCASIONS.find(o => o.value === formData.occasion)?.label} • {MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}
                </p>
              </div>
            </div>

            {/* Campo principal - História */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Heart size={16} className="text-violet-500 fill-violet-500" />
                Conte a história de {formData.honoreeName}
              </label>
              <p className="text-xs text-gray-500">
                Quanto mais detalhes você compartilhar, mais especial e personalizada ficará a música!
              </p>
              <textarea
                value={formData.storyAndMessage}
                onChange={(e) => updateField('storyAndMessage', e.target.value)}
                rows={6}
                maxLength={1000}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-0 resize-none text-sm"
              />
              <div className="flex justify-between items-start">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex-1 mr-2">
                  <p className="text-xs text-amber-700">
                    <strong>Dicas:</strong> Qualidades especiais, memórias marcantes, apelidos carinhosos, o que você quer que ela saiba...
                  </p>
                </div>
                <span className={`text-xs font-medium ${formData.storyAndMessage.length < 20 ? 'text-red-500' : 'text-green-500'}`}>
                  {formData.storyAndMessage.length}/1000
                </span>
              </div>
            </div>

            {/* Familiares (opcional) */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Users size={16} className="text-violet-500" />
                Familiares para mencionar
                <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                value={formData.familyNames}
                onChange={(e) => updateField('familyNames', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-0 text-sm"
              />
              <p className="text-xs text-gray-400">
                Ex: João (pai), Maria (mãe), Pedro e Ana (filhos)
              </p>
            </div>
          </div>
        )}

        {/* ===== PASSO 3 - Ver Letra ===== */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeInUp">

            {generatingLyrics ? (
              <div className="text-center py-8">
                {/* Animação de notas musicais */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <Music className="text-violet-500 animate-bounce" size={28} />
                  </div>
                  {/* Notas flutuantes */}
                  <span className="absolute -top-2 -right-2 text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎵</span>
                  <span className="absolute -bottom-1 -left-3 text-xl animate-bounce" style={{ animationDelay: '0.3s' }}>🎶</span>
                  <span className="absolute top-0 -left-4 text-lg animate-bounce" style={{ animationDelay: '0.5s' }}>✨</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Criando a letra para {formData.honoreeName}...
                </h3>

                <p className="text-violet-600 font-medium mb-4">
                  Estamos gerando sua letra para sua aprovação
                </p>

                <div className="bg-violet-50 rounded-xl p-4 max-w-sm mx-auto mb-4">
                  <div className="flex items-center gap-3 text-left">
                    <Loader2 className="animate-spin text-violet-500 flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-gray-700">
                        Nossa IA está compondo versos únicos e emocionantes baseados na sua história...
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-xs">
                  Aguarde alguns segundos ⏳
                </p>
              </div>
            ) : lyricsError ? (
              <div className="text-center py-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <p className="text-red-600 text-sm">{lyricsError}</p>
                </div>
                <button
                  type="button"
                  onClick={generateLyrics}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-violet-500 text-white rounded-lg font-bold text-sm hover:bg-violet-600 transition-colors"
                >
                  <RefreshCw size={16} />
                  Tentar Novamente
                </button>
              </div>
            ) : formData.generatedLyrics ? (
              <>
                {/* Letra gerada */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Music size={18} className="text-violet-500" />
                      <span className="font-bold text-gray-900 text-sm">Letra para {formData.honoreeName}</span>
                    </div>
                    <span className="text-xs bg-violet-100 text-violet-600 px-2 py-1 rounded-full font-medium">
                      {MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-4 max-h-[250px] overflow-y-auto shadow-inner">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">
                      {formData.generatedLyrics}
                    </pre>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={generateLyrics}
                    disabled={generatingLyrics}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-violet-300 text-violet-600 rounded-xl font-bold text-sm hover:bg-violet-50 transition-colors"
                  >
                    <RefreshCw size={16} />
                    Nova Versão
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('lyricsApproved', true)}
                    disabled={formData.lyricsApproved}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                      formData.lyricsApproved
                        ? 'bg-green-500 text-white'
                        : 'bg-violet-500 text-white hover:bg-violet-600'
                    }`}
                  >
                    <Check size={16} />
                    {formData.lyricsApproved ? 'Aprovada!' : 'Aprovar Letra'}
                  </button>
                </div>

                {formData.lyricsApproved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center animate-fadeInUp">
                    <p className="text-green-700 text-sm font-medium flex items-center justify-center gap-2">
                      <Check size={16} />
                      Letra aprovada! Clique em Próximo para continuar.
                    </p>
                  </div>
                )}

                {/* Edição manual */}
                <details className="border border-gray-200 rounded-xl overflow-hidden">
                  <summary className="px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 flex items-center gap-2">
                    <Edit3 size={14} />
                    Quer editar a letra manualmente?
                  </summary>
                  <div className="p-4 pt-0 border-t border-gray-100">
                    <textarea
                      value={formData.generatedLyrics}
                      onChange={(e) => {
                        updateField('generatedLyrics', e.target.value);
                        updateField('lyricsApproved', false);
                      }}
                      rows={10}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono resize-none focus:border-violet-500 focus:ring-0"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Após editar, clique em "Aprovar Letra" novamente.
                    </p>
                  </div>
                </details>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-violet-500" size={32} />
                </div>
                <p className="text-gray-600 mb-4">Clique para gerar sua letra personalizada</p>
                <button
                  type="button"
                  onClick={generateLyrics}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-600 transition-colors"
                >
                  <Sparkles size={18} />
                  Gerar Letra
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== PASSO 4 - Dados de contato ===== */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeInUp">

            {/* Seus dados */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <User size={16} className="text-violet-500" />
                  Seu nome
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => updateField('userName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-0 text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <Phone size={16} className="text-violet-500" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => updateField('whatsapp', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-0 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                    <Mail size={16} className="text-violet-500" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:ring-0 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-violet-500" />
                Resumo do pedido
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Música para:</span>
                  <span className="font-semibold text-gray-900">{formData.honoreeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ocasião:</span>
                  <span className="font-semibold text-gray-900">{OCCASIONS.find(o => o.value === formData.occasion)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estilo:</span>
                  <span className="font-semibold text-gray-900">{MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-black text-violet-600">R$ 79,99</span>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-3">
                <p className="text-xs text-green-700 text-center font-medium">
                  🎵 Você receberá 2 melodias diferentes incluídas!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== Botões de navegação ===== */}
        <div className="flex gap-3 pt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 text-sm hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed() || generatingLyrics}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${
                canProceed() && !generatingLyrics
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {generatingLyrics ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Gerando...
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          ) : (
            <div className="flex-1">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!canProceed() || loading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-bold text-base transition-all ${
                  canProceed() && !loading
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-300'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Lock size={18} />
                    Finalizar e Pagar R$ 79,99
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 pt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Shield size={12} className="text-green-500" />
            <span>Seguro</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-violet-500" />
            <span>Entrega 24h</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart size={12} className="text-red-400" />
            <span>+2.000 clientes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
