"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '@/lib/data';
import { ArrowRight, ArrowLeft, Loader2, Lock, Heart, Music, Mic2, Sparkles, Check, Shield, Clock, FileText, RefreshCw, Edit3, CreditCard } from 'lucide-react';

// Opções de relacionamento (para música) - Inclui Chá Revelação
const RELATIONSHIPS = [
  { value: 'filho', label: 'Filho(a)', emoji: '👶' },
  { value: 'pai', label: 'Pai', emoji: '👨' },
  { value: 'mae', label: 'Mãe', emoji: '👩' },
  { value: 'esposo', label: 'Esposo(a)', emoji: '💑' },
  { value: 'namorado', label: 'Namorado(a)', emoji: '💕' },
  { value: 'irmao', label: 'Irmão(ã)', emoji: '👫' },
  { value: 'avo', label: 'Avô/Avó', emoji: '👴' },
  { value: 'amigo', label: 'Amigo(a)', emoji: '🤝' },
  { value: 'cha-revelacao', label: 'Chá Revelação', emoji: '🎀' },
  { value: 'outro', label: 'Outro', emoji: '✨' },
];

// Tipos de locução
const VOICEOVER_PURPOSES = [
  { value: 'empresa', label: 'Empresa', emoji: '🏢', desc: 'Institucional ou comercial' },
  { value: 'convite', label: 'Convite', emoji: '💌', desc: 'Eventos e celebrações' },
  { value: 'evento', label: 'Evento', emoji: '🎉', desc: 'Shows, festas, palestras' },
  { value: 'video', label: 'Vídeo', emoji: '🎬', desc: 'YouTube, redes sociais' },
  { value: 'mensagem', label: 'Mensagem Especial', emoji: '💝', desc: 'Homenagem pessoal' },
  { value: 'propaganda', label: 'Propaganda', emoji: '📢', desc: 'Anúncios e comerciais' },
  { value: 'podcast', label: 'Podcast/Vinheta', emoji: '🎙️', desc: 'Abertura e encerramento' },
  { value: 'outro', label: 'Outro', emoji: '✨', desc: 'Outros fins' },
];

// Tipos de locução (o que será dito)
const VOICEOVER_TYPES = [
  { value: 'boas-vindas', label: 'Boas-vindas', emoji: '👋' },
  { value: 'convite', label: 'Convite', emoji: '💌' },
  { value: 'agradecimento', label: 'Agradecimento', emoji: '🙏' },
  { value: 'aviso', label: 'Aviso/Informativo', emoji: '📢' },
  { value: 'apresentacao', label: 'Apresentação', emoji: '🎤' },
  { value: 'promocao', label: 'Promoção', emoji: '🏷️' },
  { value: 'homenagem', label: 'Homenagem', emoji: '🏆' },
  { value: 'outro', label: 'Outro', emoji: '✨' },
];

// Estilos de locução
const VOICEOVER_STYLES = [
  { value: 'profissional', label: 'Profissional', emoji: '👔', desc: 'Formal e corporativo' },
  { value: 'acolhedor', label: 'Acolhedor', emoji: '🤗', desc: 'Caloroso e amigável' },
  { value: 'animado', label: 'Animado', emoji: '🎉', desc: 'Energético e vibrante' },
  { value: 'suave', label: 'Suave', emoji: '🌸', desc: 'Calmo e delicado' },
  { value: 'serio', label: 'Sério', emoji: '📋', desc: 'Formal e direto' },
  { value: 'divertido', label: 'Divertido', emoji: '😄', desc: 'Leve e descontraído' },
];

// Ocasiões especiais
const OCCASIONS = [
  { value: 'aniversario', label: 'Aniversário', emoji: '🎂' },
  { value: 'casamento', label: 'Casamento', emoji: '💒' },
  { value: 'cha-revelacao', label: 'Chá Revelação', emoji: '👶' },
  { value: 'mesversario', label: 'Mesversário', emoji: '🍼' },
  { value: 'namoro', label: 'Dia dos Namorados', emoji: '💝' },
  { value: 'maes', label: 'Dia das Mães', emoji: '🌸' },
  { value: 'pais', label: 'Dia dos Pais', emoji: '👔' },
  { value: 'formatura', label: 'Formatura', emoji: '🎓' },
  { value: 'natal', label: 'Natal', emoji: '🎄' },
  { value: 'homenagem', label: 'Homenagem Especial', emoji: '🏆' },
  { value: 'declaracao', label: 'Declaração de Amor', emoji: '💌' },
  { value: 'outro', label: 'Outro momento', emoji: '🌟' },
];

// Estilos musicais
const MUSIC_STYLES = [
  { value: 'romantico', label: 'Romântico', desc: 'Suave e apaixonado' },
  { value: 'sertanejo', label: 'Sertanejo', desc: 'Do nosso Brasil' },
  { value: 'mpb', label: 'MPB', desc: 'Melodia brasileira' },
  { value: 'pop', label: 'Pop', desc: 'Moderno e cativante' },
  { value: 'gospel', label: 'Gospel', desc: 'Fé e gratidão' },
  { value: 'forro', label: 'Forró', desc: 'Alegre e dançante' },
  { value: 'rock', label: 'Rock', desc: 'Com energia' },
  { value: 'jazz', label: 'Jazz/Blues', desc: 'Sofisticado' },
  { value: 'reggae', label: 'Reggae', desc: 'Leve e positivo' },
  { value: 'infantil', label: 'Infantil', desc: 'Para crianças' },
];

// Preferências de voz
const VOICE_OPTIONS = [
  { value: 'feminina', label: 'Voz Feminina', emoji: '👩‍🎤' },
  { value: 'masculina', label: 'Voz Masculina', emoji: '👨‍🎤' },
  { value: 'sem_preferencia', label: 'Sem Preferência', emoji: '🎤' },
];

interface FormData {
  // Campos para música
  relationship: string;
  honoreeName: string;
  occasion: string;
  musicStyle: string;
  voicePreference: string;
  qualities: string;
  memories: string;
  heartMessage: string;
  familyNames: string; // Nomes de familiares (até 10)
  userName: string;
  whatsapp: string;
  email: string;
  // Campos específicos para chá revelação
  knowsBabySex: string;
  babySex: string;
  babyNameBoy: string;
  babyNameGirl: string;
  // Campo para a letra gerada
  generatedLyrics: string;
  lyricsApproved: boolean;
  // Campos específicos para locução
  voiceoverPurpose: string;
  voiceoverName: string;
  voiceoverType: string;
  voiceoverStyle: string;
  voiceoverScript: string;
  voiceoverIdea: string; // Ideia/rascunho do cliente
  generatedScript: string; // Texto gerado pela IA
  scriptApproved: boolean; // Se o texto foi aprovado
}

export default function BookingForm({ service }: { service: Service }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>(null);
  const [formData, setFormData] = useState<FormData>({
    relationship: '',
    honoreeName: '',
    occasion: '',
    musicStyle: '',
    voicePreference: 'sem_preferencia',
    qualities: '',
    memories: '',
    heartMessage: '',
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
    // Campos para locução
    voiceoverPurpose: '',
    voiceoverName: '',
    voiceoverType: '',
    voiceoverStyle: '',
    voiceoverScript: '',
    voiceoverIdea: '',
    generatedScript: '',
    scriptApproved: false,
  });

  const [generatingScript, setGeneratingScript] = useState(false);
  const [scriptError, setScriptError] = useState('');

  const isVoice = service.type === 'voiceover';
  // Para música: 6 passos (inclui visualização da letra)
  // Para locução: 5 passos (inclui visualização do texto)
  const totalSteps = isVoice ? 5 : 6;
  const progress = (step / totalSteps) * 100;

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (isVoice) {
      // Validação para locução (5 passos)
      switch (step) {
        case 1:
          // Para que será a locução + Nome
          return formData.voiceoverPurpose && formData.voiceoverName.trim().length >= 2;
        case 2:
          // O que será dito + Estilo + Voz
          return formData.voiceoverType && formData.voiceoverStyle && formData.voicePreference;
        case 3:
          // Ideia/rascunho (opcional)
          return true;
        case 4:
          // Ver e aprovar texto
          return formData.scriptApproved && formData.generatedScript.trim().length > 0;
        case 5:
          // Finalizar - dados de contato + método de pagamento
          return formData.userName.trim() && formData.whatsapp.trim().length >= 10 && paymentMethod !== null;
        default:
          return false;
      }
    } else {
      // Validação para música (6 passos)
      switch (step) {
        case 1:
          // Se for chá revelação, validar campos específicos
          if (formData.relationship === 'cha-revelacao') {
            if (!formData.knowsBabySex) return false;
            if (formData.knowsBabySex === 'sim' && !formData.babySex) return false;
            if (formData.knowsBabySex === 'sim' && formData.babySex === 'menino' && !formData.babyNameBoy.trim()) return false;
            if (formData.knowsBabySex === 'sim' && formData.babySex === 'menina' && !formData.babyNameGirl.trim()) return false;
            if (formData.knowsBabySex === 'nao' && (!formData.babyNameBoy.trim() || !formData.babyNameGirl.trim())) return false;
          }
          return formData.relationship && formData.honoreeName.trim().length >= 2;
        case 2:
          // Se já é chá revelação (definido no passo 1), não precisa validar novamente
          if (formData.relationship === 'cha-revelacao') {
            return formData.musicStyle;
          }
          return formData.occasion && formData.musicStyle;
        case 3:
          // Qualidades e informações - agora obrigatório
          return formData.qualities.trim().length >= 10;
        case 4:
          // Memórias e familiares - agora obrigatório
          return formData.memories.trim().length >= 10 && formData.heartMessage.trim().length >= 5;
        case 5:
          // Para música: passo 5 é ver a letra
          return formData.lyricsApproved && formData.generatedLyrics.trim().length > 0;
        case 6:
          // Finalizar - e-mail agora obrigatório + método de pagamento
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return formData.userName.trim().length >= 2 &&
                 formData.whatsapp.trim().length >= 10 &&
                 emailRegex.test(formData.email.trim()) &&
                 paymentMethod !== null;
        default:
          return false;
      }
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
          qualities: formData.qualities,
          memories: formData.memories,
          heartMessage: formData.heartMessage,
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

  const generateScript = async () => {
    setGeneratingScript(true);
    setScriptError('');

    try {
      const response = await fetch('/api/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceoverPurpose: formData.voiceoverPurpose,
          voiceoverPurposeLabel: VOICEOVER_PURPOSES.find(p => p.value === formData.voiceoverPurpose)?.label || formData.voiceoverPurpose,
          voiceoverName: formData.voiceoverName,
          voiceoverType: formData.voiceoverType,
          voiceoverTypeLabel: VOICEOVER_TYPES.find(t => t.value === formData.voiceoverType)?.label || formData.voiceoverType,
          voiceoverStyle: formData.voiceoverStyle,
          voiceoverStyleLabel: VOICEOVER_STYLES.find(s => s.value === formData.voiceoverStyle)?.label || formData.voiceoverStyle,
          voicePreference: formData.voicePreference,
          voiceoverScript: formData.voiceoverIdea, // Ideia do cliente como base
        }),
      });

      const data = await response.json();

      if (data.error) {
        setScriptError(data.error);
      } else if (data.script) {
        updateField('generatedScript', data.script);
        updateField('scriptApproved', false);
      }
    } catch (error) {
      console.error('Error generating script:', error);
      setScriptError('Erro ao gerar texto. Por favor, tente novamente.');
    } finally {
      setGeneratingScript(false);
    }
  };

  const nextStep = async () => {
    if (step < totalSteps && canProceed()) {
      // Se for música e está indo para o passo 5 (ver letra), gerar a letra automaticamente
      if (!isVoice && step === 4 && !formData.generatedLyrics) {
        await generateLyrics();
      }
      // Se for locução e está indo para o passo 4 (ver texto), gerar o texto automaticamente
      if (isVoice && step === 3 && !formData.generatedScript) {
        await generateScript();
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
    if (!canProceed() || !paymentMethod) return;
    setLoading(true);

    const details = {
      ...formData,
      // Labels para música
      relationshipLabel: RELATIONSHIPS.find(r => r.value === formData.relationship)?.label || formData.relationship,
      occasionLabel: OCCASIONS.find(o => o.value === formData.occasion)?.label || formData.occasion,
      musicStyleLabel: MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label || formData.musicStyle,
      // Labels para locução
      voiceoverPurposeLabel: VOICEOVER_PURPOSES.find(p => p.value === formData.voiceoverPurpose)?.label || formData.voiceoverPurpose,
      voiceoverTypeLabel: VOICEOVER_TYPES.find(t => t.value === formData.voiceoverType)?.label || formData.voiceoverType,
      voiceoverStyleLabel: VOICEOVER_STYLES.find(s => s.value === formData.voiceoverStyle)?.label || formData.voiceoverStyle,
      voicePreferenceLabel: VOICE_OPTIONS.find(v => v.value === formData.voicePreference)?.label || formData.voicePreference,
    };

    try {
      // Usar Mercado Pago para todos os pagamentos (cartão e PIX)
      const response = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, details }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Redirecionar para checkout do Mercado Pago
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('URL de checkout não disponível');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Erro ao processar pedido. Tente novamente.');
      setLoading(false);
    }
  };

  // Step titles - diferente para música e locução
  const stepTitles = isVoice
    ? ['Objetivo', 'Estilo', 'Sua Ideia', 'Ver Texto', 'Finalizar']
    : ['Para Quem', 'Ocasião', 'Qualidades', 'Memórias', 'Ver Letra', 'Finalizar'];

  // Determinar qual é o passo de finalização
  const finishStep = isVoice ? 5 : 6;

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header com progresso elegante */}
      <div className="bg-gray-900 px-8 py-6">
        {/* Step indicators */}
        <div className="flex items-center justify-between mb-4">
          {stepTitles.map((title, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center gap-2 ${index + 1 <= step ? 'text-white' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  index + 1 < step ? 'bg-violet-500 text-white' :
                  index + 1 === step ? 'bg-white text-gray-900' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {index + 1 < step ? <Check size={16} /> : index + 1}
                </div>
                <span className="hidden md:block text-sm font-medium">{title}</span>
              </div>
              {index < stepTitles.length - 1 && (
                <div className={`w-8 md:w-16 h-0.5 mx-2 ${
                  index + 1 < step ? 'bg-violet-500' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Conteúdo do formulário */}
      <div className="p-8 md:p-10">
        {/* PASSO 1 - Para Quem (Música) ou Objetivo (Locução) */}
        {step === 1 && !isVoice && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="text-violet-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Vamos começar!
              </h2>
              <p className="text-gray-500">Para quem é essa música?</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {RELATIONSHIPS.map((rel) => (
                <button
                  key={rel.value}
                  type="button"
                  onClick={() => {
                    updateField('relationship', rel.value);
                    // Se for chá revelação, definir a ocasião automaticamente
                    if (rel.value === 'cha-revelacao') {
                      updateField('occasion', 'cha-revelacao');
                    } else if (formData.occasion === 'cha-revelacao') {
                      // Se estava em chá revelação e mudou, limpar a ocasião
                      updateField('occasion', '');
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 hover:-translate-y-1 ${
                    formData.relationship === rel.value
                      ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
                      : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                  }`}
                >
                  <span className="text-3xl mb-2 block">{rel.emoji}</span>
                  <span className={`font-semibold text-sm ${formData.relationship === rel.value ? 'text-violet-600' : 'text-gray-700'}`}>
                    {rel.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Campos específicos para Chá Revelação - aparecem no passo 1 */}
            {formData.relationship === 'cha-revelacao' && (
              <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100 space-y-6 animate-fadeInUp">
                <div className="text-center">
                  <span className="text-4xl">👶</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">Detalhes do Chá Revelação</h3>
                  <p className="text-sm text-gray-500">Precisamos de algumas informações especiais</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700">
                    Você já sabe o sexo do bebê? *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        updateField('knowsBabySex', 'sim');
                        updateField('babyNameBoy', '');
                        updateField('babyNameGirl', '');
                        updateField('babySex', '');
                      }}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        formData.knowsBabySex === 'sim'
                          ? 'border-pink-500 bg-pink-100'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">✅</span>
                      <span className="font-bold text-sm">Sim, já sei!</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('knowsBabySex', 'nao');
                        updateField('babySex', '');
                      }}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        formData.knowsBabySex === 'nao'
                          ? 'border-pink-500 bg-pink-100'
                          : 'border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">🎁</span>
                      <span className="font-bold text-sm">Não, é surpresa!</span>
                    </button>
                  </div>
                </div>

                {formData.knowsBabySex === 'sim' && (
                  <div className="space-y-3 animate-fadeInUp">
                    <label className="block text-sm font-bold text-gray-700">
                      Qual o sexo do bebê? *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          updateField('babySex', 'menino');
                          updateField('babyNameGirl', '');
                        }}
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          formData.babySex === 'menino'
                            ? 'border-blue-500 bg-blue-100'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <span className="text-3xl block mb-1">👶🏻💙</span>
                        <span className="font-bold text-sm text-blue-600">Menino</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateField('babySex', 'menina');
                          updateField('babyNameBoy', '');
                        }}
                        className={`p-4 rounded-2xl border-2 text-center transition-all ${
                          formData.babySex === 'menina'
                            ? 'border-pink-500 bg-pink-100'
                            : 'border-gray-200 hover:border-pink-300'
                        }`}
                      >
                        <span className="text-3xl block mb-1">👶🏻💖</span>
                        <span className="font-bold text-sm text-pink-600">Menina</span>
                      </button>
                    </div>

                    {formData.babySex === 'menino' && (
                      <div className="space-y-2 animate-fadeInUp">
                        <label className="block text-sm font-bold text-gray-700">Nome do bebê *</label>
                        <input
                          type="text"
                          value={formData.babyNameBoy}
                          onChange={(e) => updateField('babyNameBoy', e.target.value)}
                          placeholder="Ex: Miguel, Arthur, Heitor..."
                          className="input-elegant"
                        />
                      </div>
                    )}
                    {formData.babySex === 'menina' && (
                      <div className="space-y-2 animate-fadeInUp">
                        <label className="block text-sm font-bold text-gray-700">Nome do bebê *</label>
                        <input
                          type="text"
                          value={formData.babyNameGirl}
                          onChange={(e) => updateField('babyNameGirl', e.target.value)}
                          placeholder="Ex: Helena, Alice, Laura..."
                          className="input-elegant"
                        />
                      </div>
                    )}
                  </div>
                )}

                {formData.knowsBabySex === 'nao' && (
                  <div className="space-y-4 animate-fadeInUp">
                    <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                      <p className="text-sm text-violet-700">
                        <strong>Atenção:</strong> Como você ainda não sabe o sexo, vamos criar uma letra com
                        <strong> contagem de suspense e dois finais</strong> - um para menino e um para menina!
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-blue-600">💙 Nome se for Menino *</label>
                        <input
                          type="text"
                          value={formData.babyNameBoy}
                          onChange={(e) => updateField('babyNameBoy', e.target.value)}
                          placeholder="Ex: Miguel, Arthur..."
                          className="input-elegant border-blue-200 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-pink-600">💖 Nome se for Menina *</label>
                        <input
                          type="text"
                          value={formData.babyNameGirl}
                          onChange={(e) => updateField('babyNameGirl', e.target.value)}
                          placeholder="Ex: Helena, Alice..."
                          className="input-elegant border-pink-200 focus:border-pink-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nome da pessoa - só aparece se NÃO for chá revelação */}
            {formData.relationship !== 'cha-revelacao' && (
              <div className="space-y-3 pt-4">
                <label className="block text-sm font-bold text-gray-700">
                  Nome da pessoa homenageada *
                </label>
                <input
                  type="text"
                  value={formData.honoreeName}
                  onChange={(e) => updateField('honoreeName', e.target.value)}
                  placeholder="Ex: Maria, João, Vovó Ana..."
                  className="input-elegant"
                />
                <p className="text-xs text-gray-400">
                  Dica: Se o nome tiver pronúncia especial, escreva como se fala
                </p>
              </div>
            )}

            {/* Nome dos pais para Chá Revelação */}
            {formData.relationship === 'cha-revelacao' && (
              <div className="space-y-3 pt-4">
                <label className="block text-sm font-bold text-gray-700">
                  Nome dos pais (ou da mamãe) *
                </label>
                <input
                  type="text"
                  value={formData.honoreeName}
                  onChange={(e) => updateField('honoreeName', e.target.value)}
                  placeholder="Ex: Ana e Pedro, Família Silva..."
                  className="input-elegant"
                />
                <p className="text-xs text-gray-400">
                  O nome que aparecerá na música
                </p>
              </div>
            )}
          </div>
        )}

        {/* PASSO 1 - Locução: Para que será essa locução? */}
        {step === 1 && isVoice && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mic2 className="text-violet-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Para que será essa locução?
              </h2>
              <p className="text-gray-500">Selecione o objetivo principal da sua locução</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {VOICEOVER_PURPOSES.map((purpose) => (
                <button
                  key={purpose.value}
                  type="button"
                  onClick={() => updateField('voiceoverPurpose', purpose.value)}
                  className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 hover:-translate-y-1 ${
                    formData.voiceoverPurpose === purpose.value
                      ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
                      : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                  }`}
                >
                  <span className="text-3xl mb-2 block">{purpose.emoji}</span>
                  <span className={`font-bold text-sm block ${formData.voiceoverPurpose === purpose.value ? 'text-violet-600' : 'text-gray-700'}`}>
                    {purpose.label}
                  </span>
                  <span className="text-xs text-gray-400">{purpose.desc}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <label className="block text-sm font-bold text-gray-700">
                Nome da empresa ou pessoa que vai aparecer na locução *
              </label>
              <input
                type="text"
                value={formData.voiceoverName}
                onChange={(e) => updateField('voiceoverName', e.target.value)}
                placeholder="Ex: Loja XYZ, João Silva, Empresa ABC..."
                className="input-elegant"
              />
              <p className="text-xs text-gray-400">
                Este nome será mencionado na locução
              </p>
            </div>
          </div>
        )}

        {/* PASSO 2 - Ocasião (Música) */}
        {step === 2 && !isVoice && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-violet-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {formData.relationship === 'cha-revelacao' ? 'Escolha o estilo' : 'Qual a ocasião?'}
              </h2>
              <p className="text-gray-500">
                {formData.relationship === 'cha-revelacao'
                  ? 'Escolha o estilo musical e voz para sua música'
                  : 'Isso nos ajuda a criar algo ainda mais especial!'}
              </p>
            </div>

            {/* Só mostrar ocasiões se NÃO for chá revelação (já definido no passo 1) */}
            {formData.relationship !== 'cha-revelacao' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {OCCASIONS.filter(occ => occ.value !== 'cha-revelacao').map((occ) => (
                  <button
                    key={occ.value}
                    type="button"
                    onClick={() => updateField('occasion', occ.value)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 hover:-translate-y-1 ${
                      formData.occasion === occ.value
                        ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
                        : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                    }`}
                  >
                    <span className="text-3xl mb-2 block">{occ.emoji}</span>
                    <span className={`font-semibold text-sm ${formData.occasion === occ.value ? 'text-violet-600' : 'text-gray-700'}`}>
                      {occ.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Resumo do Chá Revelação (já preenchido no passo 1) */}
            {formData.relationship === 'cha-revelacao' && (
              <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎀</span>
                  <div>
                    <p className="font-bold text-gray-900">Chá Revelação</p>
                    <p className="text-sm text-gray-600">
                      {formData.knowsBabySex === 'sim'
                        ? `Bebê: ${formData.babySex === 'menino' ? formData.babyNameBoy + ' 💙' : formData.babyNameGirl + ' 💖'}`
                        : `Dois finais: ${formData.babyNameBoy} 💙 ou ${formData.babyNameGirl} 💖`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Estilo musical - aparece para todos */}
            <div className="pt-6">
              <label className="block text-sm font-bold text-gray-700 mb-4">Estilo musical *</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {MUSIC_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateField('musicStyle', style.value)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 ${
                      formData.musicStyle === style.value
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <span className={`font-bold text-sm block ${formData.musicStyle === style.value ? 'text-violet-600' : 'text-gray-700'}`}>
                      {style.label}
                    </span>
                    <span className="text-xs text-gray-400">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <label className="block text-sm font-bold text-gray-700 mb-4">Preferência de voz</label>
              <div className="grid grid-cols-3 gap-4">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.value}
                    type="button"
                    onClick={() => updateField('voicePreference', voice.value)}
                    className={`p-5 rounded-2xl border-2 text-center transition-all duration-300 ${
                      formData.voicePreference === voice.value
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{voice.emoji}</span>
                    <span className={`font-bold text-sm ${formData.voicePreference === voice.value ? 'text-violet-600' : 'text-gray-600'}`}>
                      {voice.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASSO 2 - Locução: Estilo e Preferências */}
        {step === 2 && isVoice && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-violet-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Personalize sua locução
              </h2>
              <p className="text-gray-500">Escolha o tipo, estilo e voz ideal</p>
            </div>

            {/* O que será dito */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-4">O que você gostaria que fosse dito? *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {VOICEOVER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField('voiceoverType', type.value)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 hover:-translate-y-1 ${
                      formData.voiceoverType === type.value
                        ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
                        : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{type.emoji}</span>
                    <span className={`font-bold text-sm ${formData.voiceoverType === type.value ? 'text-violet-600' : 'text-gray-700'}`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo de locução */}
            <div className="pt-4">
              <label className="block text-sm font-bold text-gray-700 mb-4">Qual estilo você prefere? *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {VOICEOVER_STYLES.map((style) => (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => updateField('voiceoverStyle', style.value)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 ${
                      formData.voiceoverStyle === style.value
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{style.emoji}</span>
                    <span className={`font-bold text-sm block ${formData.voiceoverStyle === style.value ? 'text-violet-600' : 'text-gray-700'}`}>
                      {style.label}
                    </span>
                    <span className="text-xs text-gray-400">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferência de voz */}
            <div className="pt-4">
              <label className="block text-sm font-bold text-gray-700 mb-4">Você prefere voz feminina ou masculina? *</label>
              <div className="grid grid-cols-3 gap-4">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.value}
                    type="button"
                    onClick={() => updateField('voicePreference', voice.value)}
                    className={`p-5 rounded-2xl border-2 text-center transition-all duration-300 ${
                      formData.voicePreference === voice.value
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{voice.emoji}</span>
                    <span className={`font-bold text-sm ${formData.voicePreference === voice.value ? 'text-violet-600' : 'text-gray-600'}`}>
                      {voice.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASSO 3 - Qualidades (Música) */}
        {step === 3 && !isVoice && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="text-violet-600 fill-violet-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                O que torna {formData.honoreeName || 'essa pessoa'} especial?
              </h2>
              <p className="text-gray-500">Descreva as qualidades e características que você mais ama</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                Qualidades que você mais ama *
              </label>
              <textarea
                value={formData.qualities}
                onChange={(e) => updateField('qualities', e.target.value)}
                placeholder="Ex: Ela é paciente, sábia, engraçada, protetora, sempre me apoia nos momentos difíceis, tem um sorriso que ilumina qualquer ambiente..."
                rows={5}
                maxLength={500}
                className="input-elegant resize-none"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Mínimo 10 caracteres - quanto mais detalhes, mais personalizada fica!</span>
                <span>{formData.qualities.length}/500</span>
              </div>
            </div>

            <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">
              <p className="text-sm text-violet-700">
                <strong>Dica:</strong> Pense no que torna {formData.honoreeName || 'essa pessoa'} única.
                O jeito de falar? Uma mania engraçada? O cuidado com a família?
              </p>
            </div>
          </div>
        )}

        {/* PASSO 3 - Locução: Ideia/rascunho do cliente */}
        {step === 3 && isVoice && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-violet-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Conte sua ideia
              </h2>
              <p className="text-gray-500">Descreva o que você gostaria que fosse dito na locução</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                O que você quer transmitir? (opcional)
              </label>
              <textarea
                value={formData.voiceoverIdea}
                onChange={(e) => updateField('voiceoverIdea', e.target.value)}
                placeholder={`Descreva sua ideia ou o que você quer que a locução transmita.\n\nExemplos:\n\n"Quero uma mensagem de boas-vindas para minha loja, mencionando que temos os melhores preços e entrega rápida"\n\n"Preciso de um convite para o aniversário do meu filho João, dia 15 de janeiro às 19h"\n\n"Uma mensagem de agradecimento pelos 10 anos da empresa, destacando nossos clientes"`}
                rows={8}
                maxLength={1000}
                className="input-elegant resize-none"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Quanto mais detalhes, melhor será o texto gerado!</span>
                <span>{formData.voiceoverIdea.length}/1000</span>
              </div>
            </div>

            <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">
              <p className="text-sm text-violet-700">
                <strong>Na próxima etapa:</strong> Vamos criar um texto profissional baseado na sua ideia.
                Você poderá ver, editar e aprovar o texto antes de pagar!
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Dica:</strong> Inclua informações importantes como nomes, datas, horários,
                endereços ou qualquer detalhe que deve aparecer na locução.
              </p>
            </div>
          </div>
        )}

        {/* PASSO 4 - Locução: Ver e aprovar texto */}
        {step === 4 && isVoice && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="text-violet-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Seu Texto de Locução</h2>
              <p className="text-gray-500">Veja o texto criado para {formData.voiceoverName}</p>
            </div>

            {generatingScript ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin text-violet-500 mx-auto mb-4" size={48} />
                <p className="text-gray-600 font-medium">Criando seu texto de locução...</p>
                <p className="text-gray-400 text-sm mt-2">Isso pode levar alguns segundos</p>
              </div>
            ) : scriptError ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                  <p className="text-red-600 font-medium">{scriptError}</p>
                </div>
                <button
                  type="button"
                  onClick={generateScript}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-600 transition-colors"
                >
                  <RefreshCw size={18} />
                  Tentar Novamente
                </button>
              </div>
            ) : formData.generatedScript ? (
              <>
                {/* Área do texto */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Mic2 size={20} className="text-violet-500" />
                      Texto da Locução
                    </h3>
                    <span className="text-xs text-violet-600 bg-violet-100 px-3 py-1 rounded-full">
                      {VOICEOVER_STYLES.find(s => s.value === formData.voiceoverStyle)?.label}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-inner max-h-[300px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                      {formData.generatedScript}
                    </pre>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={generateScript}
                    disabled={generatingScript}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-violet-300 text-violet-600 rounded-xl font-bold hover:bg-violet-50 transition-colors"
                  >
                    <RefreshCw size={18} />
                    Gerar Nova Versão
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('scriptApproved', true)}
                    disabled={formData.scriptApproved}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-colors ${
                      formData.scriptApproved
                        ? 'bg-green-500 text-white'
                        : 'bg-violet-500 text-white hover:bg-violet-600'
                    }`}
                  >
                    {formData.scriptApproved ? (
                      <>
                        <Check size={18} />
                        Texto Aprovado!
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Aprovar Este Texto
                      </>
                    )}
                  </button>
                </div>

                {formData.scriptApproved && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-green-700 font-medium">
                      ✅ Texto aprovado! Clique em "Próximo" para continuar.
                    </p>
                  </div>
                )}

                {/* Área para edição manual */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Edit3 size={16} className="text-gray-500" />
                    <label className="text-sm font-bold text-gray-700">
                      Quer fazer ajustes? Edite o texto abaixo:
                    </label>
                  </div>
                  <textarea
                    value={formData.generatedScript}
                    onChange={(e) => {
                      updateField('generatedScript', e.target.value);
                      updateField('scriptApproved', false);
                    }}
                    rows={8}
                    className="input-elegant resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Após editar, clique em "Aprovar Este Texto" para confirmar suas alterações.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Clique no botão abaixo para gerar seu texto de locução</p>
                <button
                  type="button"
                  onClick={generateScript}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-600 transition-colors"
                >
                  <Sparkles size={18} />
                  Gerar Texto
                </button>
              </div>
            )}
          </div>
        )}

        {/* PASSO 4 - Memórias (Música) */}
        {step === 4 && !isVoice && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Music className="text-violet-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Memórias especiais</h2>
              <p className="text-gray-500">Momentos marcantes que vocês viveram juntos</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                Momentos especiais *
              </label>
              <textarea
                value={formData.memories}
                onChange={(e) => updateField('memories', e.target.value)}
                placeholder="Ex: Lembro do dia em que nos conhecemos... Nossa primeira viagem juntos foi inesquecível... Ela sempre fazia bolo de chocolate nos domingos..."
                rows={6}
                maxLength={800}
                className="input-elegant resize-none"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Mínimo 10 caracteres - histórias reais deixam a música mais emocionante!</span>
                <span>{formData.memories.length}/800</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                Mensagem do coração *
              </label>
              <textarea
                value={formData.heartMessage}
                onChange={(e) => updateField('heartMessage', e.target.value)}
                placeholder="O que você quer que essa pessoa saiba, sinta ou lembre?"
                rows={4}
                maxLength={500}
                className="input-elegant resize-none"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Mínimo 5 caracteres</span>
                <span>{formData.heartMessage.length}/500</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                Nomes de familiares para mencionar na música (opcional)
              </label>
              <textarea
                value={formData.familyNames}
                onChange={(e) => updateField('familyNames', e.target.value)}
                placeholder="Ex: João (pai), Maria (mãe), Pedro e Ana (filhos), Vovó Rosa..."
                rows={3}
                maxLength={300}
                className="input-elegant resize-none"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Até 10 nomes de familiares que podem aparecer na letra</span>
                <span>{formData.familyNames.length}/300</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <p className="text-sm text-gray-600">
                <strong>Pense em:</strong> Como vocês se conheceram? Uma viagem especial? Piadas internas? Apelidos carinhosos?
              </p>
            </div>
          </div>
        )}

        {/* PASSO 5 - Ver Letra (apenas para música) */}
        {step === 5 && !isVoice && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="text-violet-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sua Letra Personalizada</h2>
              <p className="text-gray-500">Veja a letra criada especialmente para {formData.honoreeName}</p>
            </div>

            {generatingLyrics ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin text-violet-500 mx-auto mb-4" size={48} />
                <p className="text-gray-600 font-medium">Criando sua letra personalizada...</p>
                <p className="text-gray-400 text-sm mt-2">Isso pode levar alguns segundos</p>
              </div>
            ) : lyricsError ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                  <p className="text-red-600 font-medium">{lyricsError}</p>
                </div>
                <button
                  type="button"
                  onClick={generateLyrics}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-xl font-bold hover:bg-violet-600 transition-colors"
                >
                  <RefreshCw size={18} />
                  Tentar Novamente
                </button>
              </div>
            ) : formData.generatedLyrics ? (
              <>
                {/* Área da letra */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border-2 border-violet-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Music size={20} className="text-violet-500" />
                      Letra da Música
                    </h3>
                    <span className="text-xs text-violet-600 bg-violet-100 px-3 py-1 rounded-full">
                      {MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-inner max-h-[400px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                      {formData.generatedLyrics}
                    </pre>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={generateLyrics}
                    disabled={generatingLyrics}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-violet-300 text-violet-600 rounded-xl font-bold hover:bg-violet-50 transition-colors"
                  >
                    <RefreshCw size={18} />
                    Gerar Nova Versão
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('lyricsApproved', true)}
                    disabled={formData.lyricsApproved}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-colors ${
                      formData.lyricsApproved
                        ? 'bg-green-500 text-white'
                        : 'bg-violet-500 text-white hover:bg-violet-600'
                    }`}
                  >
                    {formData.lyricsApproved ? (
                      <>
                        <Check size={18} />
                        Letra Aprovada!
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Aprovar Esta Letra
                      </>
                    )}
                  </button>
                </div>

                {formData.lyricsApproved && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-green-700 font-medium">
                      ✅ Letra aprovada! Clique em "Próximo" para continuar.
                    </p>
                  </div>
                )}

                {/* Área para edição manual */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Edit3 size={16} className="text-gray-500" />
                    <label className="text-sm font-bold text-gray-700">
                      Quer fazer ajustes? Edite a letra abaixo:
                    </label>
                  </div>
                  <textarea
                    value={formData.generatedLyrics}
                    onChange={(e) => {
                      updateField('generatedLyrics', e.target.value);
                      updateField('lyricsApproved', false);
                    }}
                    rows={10}
                    className="input-elegant resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Após editar, clique em "Aprovar Esta Letra" para confirmar suas alterações.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Clique no botão abaixo para gerar sua letra personalizada</p>
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

        {/* PASSO 5 (locução) ou PASSO 6 (música) - Finalizar */}
        {step === finishStep && (
          <div className="space-y-8 animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quase lá!</h2>
              <p className="text-gray-500">Seus dados para entrega</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Seu nome *</label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => updateField('userName', e.target.value)}
                  placeholder="Como devemos te chamar?"
                  className="input-elegant"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">WhatsApp *</label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="input-elegant"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">E-mail *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="seu@email.com"
                className="input-elegant"
              />
              <p className="text-xs text-gray-400">Usaremos para enviar confirmação e atualizações do pedido</p>
            </div>

            {/* Escolha do método de pagamento */}
            <div className="space-y-4 pt-4">
              <label className="block text-sm font-bold text-gray-700">Como você prefere pagar? *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-5 rounded-2xl border-2 text-center transition-all duration-300 hover:-translate-y-1 ${
                    paymentMethod === 'card'
                      ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
                      : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                  }`}
                >
                  <CreditCard className={`w-10 h-10 mx-auto mb-3 ${paymentMethod === 'card' ? 'text-violet-600' : 'text-gray-400'}`} />
                  <span className={`font-bold text-sm block ${paymentMethod === 'card' ? 'text-violet-600' : 'text-gray-700'}`}>
                    Cartão de Crédito
                  </span>
                  <span className="text-xs text-gray-400 mt-1 block">Parcele em até 12x</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-5 rounded-2xl border-2 text-center transition-all duration-300 hover:-translate-y-1 ${
                    paymentMethod === 'pix'
                      ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <svg viewBox="0 0 512 512" className={`w-10 h-10 mx-auto mb-3 ${paymentMethod === 'pix' ? 'fill-green-600' : 'fill-gray-400'}`}>
                    <path d="M242.4 292.5c-18.4-13.5-38.4-25.3-59.9-35.3-5.9-2.7-11.9-5.2-18-7.5 19.1-8.9 36.3-21.2 50.5-36.9 17.4-19.2 29.8-42.6 35.5-68.2 3.8-17.2 4.7-35.2 2.3-52.6-2.4-17.4-8-34.1-16.4-49.1-8.4-15-19.6-28.2-32.8-38.9-13.2-10.7-28.3-18.7-44.4-23.5-16.1-4.8-33-6.5-49.8-4.9-16.9 1.6-33.2 6.6-47.9 14.6l-2.4 1.3-2.4 1.3c-14.1 8.4-26.3 19.5-36 32.5-9.6 13-16.8 27.9-21.1 43.6-4.3 15.7-5.7 32.2-4 48.4 1.7 16.2 6.3 31.9 13.6 46.2 7.3 14.3 17.1 27 29 37.6 11.9 10.6 25.6 18.9 40.4 24.5 14.8 5.6 30.4 8.5 46.1 8.4h.2c6.5 0 13-.4 19.4-1.2-5.7 6.5-12.2 12.3-19.5 17.2-18.4 12.4-40.1 19.8-62.6 21.3-22.5 1.5-45.1-3-65.4-12.9-20.3-9.9-37.9-24.8-50.8-43.3-12.9-18.5-20.8-40.1-22.8-62.5-2-22.4 2-45.1 11.6-65.6 9.6-20.5 24.4-38.2 43-51.2 18.6-13 40.1-21.1 62.5-23.4 22.4-2.3 45.1 1.4 65.8 10.8 20.7 9.4 38.6 24 52 42.2 13.4 18.2 22.1 39.6 25 62 2.9 22.4-.1 45.2-8.9 66.1-8.8 20.9-22.9 39.3-41 53.2z"/>
                  </svg>
                  <span className={`font-bold text-sm block ${paymentMethod === 'pix' ? 'text-green-600' : 'text-gray-700'}`}>
                    PIX
                  </span>
                  <span className="text-xs text-gray-400 mt-1 block">Aprovação instantânea</span>
                </button>
              </div>
            </div>

            {/* Resumo do pedido */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4">Resumo do seu pedido</h4>
              <div className="space-y-2 text-sm">
                {/* Resumo para Locução */}
                {isVoice && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Objetivo:</span>
                      <span className="font-semibold">{VOICEOVER_PURPOSES.find(p => p.value === formData.voiceoverPurpose)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nome/Empresa:</span>
                      <span className="font-semibold">{formData.voiceoverName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-semibold">{VOICEOVER_TYPES.find(t => t.value === formData.voiceoverType)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estilo:</span>
                      <span className="font-semibold">{VOICEOVER_STYLES.find(s => s.value === formData.voiceoverStyle)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Voz:</span>
                      <span className="font-semibold">{VOICE_OPTIONS.find(v => v.value === formData.voicePreference)?.label}</span>
                    </div>
                    {formData.generatedScript && formData.scriptApproved && (
                      <div className="bg-green-50 p-3 rounded-xl mt-2">
                        <p className="text-xs text-green-700 font-bold mb-1">✅ Texto Aprovado:</p>
                        <p className="text-xs text-green-600 line-clamp-4">{formData.generatedScript}</p>
                      </div>
                    )}
                  </>
                )}

                {/* Resumo para Música */}
                {!isVoice && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Para:</span>
                      <span className="font-semibold">{formData.honoreeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ocasião:</span>
                      <span className="font-semibold">{OCCASIONS.find(o => o.value === formData.occasion)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estilo:</span>
                      <span className="font-semibold">{MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}</span>
                    </div>
                  </>
                )}

                {formData.occasion === 'cha-revelacao' && !isVoice && (
                  <>
                    {formData.knowsBabySex === 'sim' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Bebê:</span>
                        <span className="font-semibold">
                          {formData.babySex === 'menino' ? `${formData.babyNameBoy} 💙` : `${formData.babyNameGirl} 💖`}
                        </span>
                      </div>
                    )}
                    {formData.knowsBabySex === 'nao' && (
                      <div className="bg-violet-50 p-3 rounded-xl mt-2">
                        <p className="text-xs text-violet-700">
                          <strong>Chá Revelação:</strong> Você receberá 2 músicas!
                        </p>
                        <p className="text-xs text-violet-600 mt-1">
                          💙 {formData.babyNameBoy} (menino) | 💖 {formData.babyNameGirl} (menina)
                        </p>
                      </div>
                    )}
                  </>
                )}

                {!isVoice && formData.lyricsApproved && (
                  <div className="bg-green-50 p-3 rounded-xl mt-2">
                    <p className="text-xs text-green-700">
                      ✅ Letra aprovada e pronta para produção!
                    </p>
                  </div>
                )}

                <div className="bg-green-50 p-3 rounded-xl mt-2">
                  <p className="text-xs text-green-700">
                    {isVoice
                      ? '🎙️ Você receberá 2 tons de voz diferentes!'
                      : '🎵 Você receberá 1 letra exclusiva + 2 melodias diferentes (formas de cantar a música)!'
                    }
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-2xl text-violet-600">R$ {service.price.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de navegação */}
        <div className="flex gap-4 pt-10">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed() || generatingLyrics}
              className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 ${
                canProceed() && !generatingLyrics
                  ? 'bg-gray-900 hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {generatingLyrics ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Gerando Letra...
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!canProceed() || loading}
              className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-xl font-bold transition-all duration-300 ${
                canProceed() && !loading
                  ? paymentMethod === 'pix'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-200 hover:-translate-y-0.5 text-white'
                    : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-200 hover:-translate-y-0.5 text-white'
                  : 'bg-gray-300 cursor-not-allowed text-gray-500'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {paymentMethod === 'pix' ? (
                    <>
                      <svg viewBox="0 0 512 512" className="w-5 h-5 fill-current">
                        <path d="M242.4 292.5c-18.4-13.5-38.4-25.3-59.9-35.3-5.9-2.7-11.9-5.2-18-7.5 19.1-8.9 36.3-21.2 50.5-36.9 17.4-19.2 29.8-42.6 35.5-68.2 3.8-17.2 4.7-35.2 2.3-52.6-2.4-17.4-8-34.1-16.4-49.1-8.4-15-19.6-28.2-32.8-38.9-13.2-10.7-28.3-18.7-44.4-23.5-16.1-4.8-33-6.5-49.8-4.9-16.9 1.6-33.2 6.6-47.9 14.6l-2.4 1.3-2.4 1.3c-14.1 8.4-26.3 19.5-36 32.5-9.6 13-16.8 27.9-21.1 43.6-4.3 15.7-5.7 32.2-4 48.4 1.7 16.2 6.3 31.9 13.6 46.2 7.3 14.3 17.1 27 29 37.6 11.9 10.6 25.6 18.9 40.4 24.5 14.8 5.6 30.4 8.5 46.1 8.4h.2c6.5 0 13-.4 19.4-1.2-5.7 6.5-12.2 12.3-19.5 17.2-18.4 12.4-40.1 19.8-62.6 21.3-22.5 1.5-45.1-3-65.4-12.9-20.3-9.9-37.9-24.8-50.8-43.3-12.9-18.5-20.8-40.1-22.8-62.5-2-22.4 2-45.1 11.6-65.6 9.6-20.5 24.4-38.2 43-51.2 18.6-13 40.1-21.1 62.5-23.4 22.4-2.3 45.1 1.4 65.8 10.8 20.7 9.4 38.6 24 52 42.2 13.4 18.2 22.1 39.6 25 62 2.9 22.4-.1 45.2-8.9 66.1-8.8 20.9-22.9 39.3-41 53.2z"/>
                      </svg>
                      Pagar com PIX
                    </>
                  ) : paymentMethod === 'card' ? (
                    <>
                      <CreditCard size={18} />
                      Pagar com Cartão
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Escolha o pagamento
                    </>
                  )}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-green-500" />
            <span>Pagamento Seguro</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-violet-500" />
            <span>Entrega em 24h</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-red-400" />
            <span>+2.000 clientes felizes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
