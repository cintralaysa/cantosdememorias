"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '@/lib/data';
import { MetaPixelEvents } from './MetaPixel';
import { ArrowRight, ArrowLeft, Loader2, Lock, Heart, Music, Sparkles, Check, Shield, Clock, FileText, RefreshCw, Edit3, X, User, Phone, Mail, Users, Mic2, CheckCircle, AlertCircle, Info, CreditCard } from 'lucide-react';

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

// Estilos musicais
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
  plan: 'basico' | 'premium';
  relationship: string;
  honoreeName: string;
  occasion: string;
  musicStyle: string;
  musicStyle2: string; // Segundo estilo para plano Premium
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

// Informações dos planos
const PLANS = {
  basico: {
    name: '1 Música',
    price: 39.90,
    priceFormatted: 'R$ 39,90',
    melodias: 1,
    deliveryHours: 0,
    features: ['1 Música personalizada', 'Letra com o nome', 'Download MP3 + letra', 'Aprove antes de pagar'],
    color: 'violet',
    highlight: 'EXCLUSIVO SITE'
  },
  premium: {
    name: '3 Músicas',
    price: 79.90,
    priceFormatted: 'R$ 79,90',
    melodias: 3,
    deliveryHours: 0,
    features: ['3 Músicas personalizadas', 'Letras exclusivas', 'Temas diferentes', 'Aprove antes de pagar'],
    color: 'amber',
    highlight: 'MELHOR VALOR'
  }
};

interface SimpleBookingFormProps {
  service: Service;
  onClose?: () => void;
  isModal?: boolean;
  initialPlan?: 'basico' | 'premium';
}

export default function SimpleBookingForm({ service, onClose, isModal = false, initialPlan = 'basico' }: SimpleBookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1); // Agora começa direto nas informações
  const [loading, setLoading] = useState(false);
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    plan: initialPlan, // Usa o plano passado pela props
    relationship: '',
    honoreeName: '',
    occasion: '',
    musicStyle: '',
    musicStyle2: '', // Segundo estilo para Premium
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

  const selectedPlan = PLANS[formData.plan];
  const totalSteps = 4; // Agora são só 4 passos (removemos a escolha do plano)
  const progress = (step / totalSteps) * 100;

  // Meta Pixel: disparar ViewContent quando o formulário abre
  useEffect(() => {
    MetaPixelEvents.viewContent({
      content_name: `Formulário - Plano ${formData.plan}`,
      content_category: 'Música Personalizada',
      value: selectedPlan.price,
      currency: 'BRL',
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: // Informações (antigo passo 2)
        // Para Premium, exigir também o segundo estilo musical
        const needsSecondStyle = formData.plan === 'premium';
        const hasSecondStyle = !needsSecondStyle || formData.musicStyle2;

        if (formData.relationship === 'cha-revelacao') {
          if (!formData.babySex) return false;
          if (formData.babySex === 'menino' && !formData.babyNameBoy.trim()) return false;
          if (formData.babySex === 'menina' && !formData.babyNameGirl.trim()) return false;
          return formData.honoreeName.trim().length >= 2 && formData.musicStyle && hasSecondStyle;
        }
        return formData.relationship && formData.honoreeName.trim().length >= 2 && formData.occasion && formData.musicStyle && hasSecondStyle;
      case 2: // Sua História (antigo passo 3)
        return formData.storyAndMessage.trim().length >= 20;
      case 3: // Sua Letra (antigo passo 4)
        return formData.lyricsApproved && formData.generatedLyrics.trim().length > 0;
      case 4: // Pagamento (antigo passo 5)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return formData.userName.trim().length >= 2 && formData.whatsapp.trim().length >= 10 && emailRegex.test(formData.email.trim());
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
      setLyricsError('Erro ao gerar letra. Por favor, tente novamente.');
    } finally {
      setGeneratingLyrics(false);
    }
  };

  const nextStep = async () => {
    if (step < totalSteps && canProceed()) {
      if (step === 2 && !formData.generatedLyrics) { // Agora é passo 2 que vai para letra
        await generateLyrics();
      }
      const nextStepNum = step + 1;
      setStep(nextStepNum);

      // Meta Pixel: rastrear progresso no funil
      if (nextStepNum === 2) {
        // Usuário preencheu informações → AddToCart
        MetaPixelEvents.custom('AddToCart', {
          content_name: `Música para ${formData.honoreeName}`,
          content_category: OCCASIONS.find(o => o.value === formData.occasion)?.label,
          value: selectedPlan.price,
          currency: 'BRL',
        });
      } else if (nextStepNum === 3) {
        // Usuário escreveu a história → Lead
        MetaPixelEvents.lead({
          content_name: `Letra gerada - ${formData.honoreeName}`,
          value: selectedPlan.price,
        });
      } else if (nextStepNum === 4) {
        // Usuário aprovou a letra → InitiateCheckout
        MetaPixelEvents.initiateCheckout({
          value: selectedPlan.price,
          currency: 'BRL',
          content_name: `Plano ${formData.plan} - ${formData.honoreeName}`,
        });
      }
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Preparar dados do pedido (reutilizável)
  const prepareOrderData = () => ({
    plan: formData.plan,
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
    musicStyle2: formData.plan === 'premium' ? formData.musicStyle2 : '',
    musicStyle2Label: formData.plan === 'premium' ? MUSIC_STYLES.find(m => m.value === formData.musicStyle2)?.label : '',
    voicePreference: formData.voicePreference,
    storyAndMessage: formData.storyAndMessage,
    familyNames: formData.familyNames,
    generatedLyrics: formData.generatedLyrics,
    knowsBabySex: formData.knowsBabySex,
    babySex: formData.babySex,
    babyNameBoy: formData.babyNameBoy,
    babyNameGirl: formData.babyNameGirl,
  });

  // Redirecionar para checkout PIX (via Mercado Pago)
  const handlePixCheckout = async () => {
    if (!canProceed()) return;
    setLoading(true);
    setPaymentError(null);

    // Meta Pixel: usuário escolheu forma de pagamento
    MetaPixelEvents.addPaymentInfo({ value: selectedPlan.price, currency: 'BRL' });

    try {
      const orderData = prepareOrderData();
      sessionStorage.setItem('checkoutData', JSON.stringify({
        ...orderData,
        amount: selectedPlan.price,
      }));
      sessionStorage.setItem('checkoutMethod', 'pix');
      router.push('/checkout');
    } catch (error: any) {
      setPaymentError(error.message || 'Erro ao processar. Tente novamente.');
      setLoading(false);
    }
  };

  // Navegar para checkout com cartão (formulário embutido)
  const handleCardCheckout = async () => {
    if (!canProceed()) return;
    setLoading(true);
    setPaymentError(null);

    // Meta Pixel: usuário escolheu forma de pagamento
    MetaPixelEvents.addPaymentInfo({ value: selectedPlan.price, currency: 'BRL' });

    try {
      const orderData = prepareOrderData();
      // Salvar dados no sessionStorage para o checkout page ler
      sessionStorage.setItem('checkoutData', JSON.stringify({
        ...orderData,
        amount: selectedPlan.price,
      }));
      // Indicar que é pagamento com cartão (auto-abrir formulário)
      sessionStorage.setItem('checkoutMethod', 'card');
      router.push('/checkout');
    } catch (error: any) {
      setPaymentError(error.message || 'Erro ao processar. Tente novamente.');
      setLoading(false);
    }
  };

  const stepInfo = [
    { title: 'Informações', desc: 'Para quem é a música?' },
    { title: 'Sua História', desc: 'Conte sobre essa pessoa especial' },
    { title: 'Sua Letra', desc: 'Veja e aprove a letra criada' },
    { title: 'Pagamento', desc: 'Dados e forma de pagamento' },
  ];

  // Tela de sucesso
  if (paymentSuccess) {
    return (
      <div className={`bg-white ${isModal ? 'rounded-2xl' : 'rounded-2xl shadow-xl'} p-8 text-center`}>
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h2>
        <p className="text-gray-600 mb-4">Sua música para <strong>{formData.honoreeName}</strong> está sendo preparada com muito carinho.</p>
        <div className="bg-violet-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-violet-700">Sua música será gerada automaticamente em <strong>poucos minutos</strong>! Você receberá o link por e-mail.</p>
        </div>
        <button
          onClick={() => { if (onClose) onClose(); window.location.href = '/'; }}
          className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-700 transition"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white ${isModal ? 'rounded-2xl max-h-[90vh] overflow-hidden flex flex-col' : 'rounded-2xl shadow-xl'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">Passo {step} de {totalSteps}</span>
            </div>
            <h3 className="text-lg font-bold">{stepInfo[step - 1].title}</h3>
            <p className="text-white/70 text-xs">{stepInfo[step - 1].desc}</p>
          </div>
          <div className="text-right flex items-center gap-3">
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <span className="text-xs text-white/60 block">{selectedPlan.name}</span>
              <span className="text-xl font-black text-white">{selectedPlan.priceFormatted}</span>
            </div>
            {isModal && onClose && (
              <button onClick={onClose} className="text-white/60 hover:text-white p-1 hover:bg-white/10 rounded-lg">
                <X size={24} />
              </button>
            )}
          </div>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Conteúdo */}
      <div className={`p-4 ${isModal ? 'overflow-y-auto flex-1' : ''}`}>

        {/* PASSO 1 - INFORMAÇÕES */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeInUp">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Heart size={16} className="text-violet-500" />
                Para quem é essa música?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {RELATIONSHIPS.map((rel) => (
                  <button key={rel.value} type="button"
                    onClick={() => { updateField('relationship', rel.value); if (rel.value === 'cha-revelacao') updateField('occasion', 'cha-revelacao'); else if (formData.occasion === 'cha-revelacao') updateField('occasion', ''); }}
                    className={`p-2 rounded-xl border-2 text-center transition-all active:scale-95 ${formData.relationship === rel.value ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200'}`}>
                    <span className="text-lg block">{rel.emoji}</span>
                    <span className={`font-medium text-[9px] block mt-1 ${formData.relationship === rel.value ? 'text-violet-600' : 'text-gray-600'}`}>{rel.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {formData.relationship === 'cha-revelacao' && (
              <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl p-4 border border-pink-200 space-y-4">
                <div className="text-center"><span className="text-3xl">👶</span><h3 className="text-sm font-bold text-gray-900 mt-1">Detalhes do Chá Revelação</h3></div>
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700">Qual o sexo do bebê?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => { updateField('babySex', 'menino'); updateField('babyNameGirl', ''); updateField('knowsBabySex', 'sim'); }} className={`p-3 rounded-xl border-2 ${formData.babySex === 'menino' ? 'border-blue-500 bg-blue-100' : 'border-gray-200'}`}><span className="text-xl">💙</span><span className="font-bold text-xs block">Menino</span></button>
                    <button type="button" onClick={() => { updateField('babySex', 'menina'); updateField('babyNameBoy', ''); updateField('knowsBabySex', 'sim'); }} className={`p-3 rounded-xl border-2 ${formData.babySex === 'menina' ? 'border-pink-500 bg-pink-100' : 'border-gray-200'}`}><span className="text-xl">💖</span><span className="font-bold text-xs block">Menina</span></button>
                  </div>
                  {formData.babySex && (
                    <div><label className="block text-xs font-bold text-gray-700 mb-1">Nome do bebê</label><input type="text" value={formData.babySex === 'menino' ? formData.babyNameBoy : formData.babyNameGirl} onChange={(e) => updateField(formData.babySex === 'menino' ? 'babyNameBoy' : 'babyNameGirl', e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 text-sm" placeholder="Nome do bebê" /></div>
                  )}
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                    <p className="text-xs text-violet-700">
                      A música terá o formato: <strong>história dos pais</strong> + <strong>suspense e contagem</strong> + <strong>revelação do sexo</strong>!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><User size={16} className="text-violet-500" />{formData.relationship === 'cha-revelacao' ? 'Nome dos pais' : 'Nome da pessoa homenageada'}</label>
              <input type="text" value={formData.honoreeName} onChange={(e) => updateField('honoreeName', e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 text-base" />
            </div>

            {formData.relationship !== 'cha-revelacao' && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><Sparkles size={16} className="text-violet-500" />Qual a ocasião especial?</label>
                <div className="grid grid-cols-3 gap-2">
                  {OCCASIONS.filter(o => o.value !== 'cha-revelacao').map((occ) => (
                    <button key={occ.value} type="button" onClick={() => updateField('occasion', occ.value)} className={`p-2 rounded-xl border-2 text-center active:scale-95 ${formData.occasion === occ.value ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200'}`}>
                      <span className="text-lg block">{occ.emoji}</span>
                      <span className={`font-medium text-[9px] block mt-1 ${formData.occasion === occ.value ? 'text-violet-600' : 'text-gray-600'}`}>{occ.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Music size={16} className="text-violet-500" />
                {formData.plan === 'premium' ? 'Estilo da 1ª melodia' : 'Qual estilo musical?'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {MUSIC_STYLES.map((style) => (
                  <button key={style.value} type="button" onClick={() => updateField('musicStyle', style.value)} className={`p-2 rounded-xl border-2 text-center active:scale-95 ${formData.musicStyle === style.value ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200'}`}>
                    <span className="text-lg block">{style.emoji}</span>
                    <span className={`font-medium text-[9px] block mt-1 ${formData.musicStyle === style.value ? 'text-violet-600' : 'text-gray-600'}`}>{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Segunda melodia - apenas para Premium */}
            {formData.plan === 'premium' && formData.musicStyle && (
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                <p className="text-xs text-purple-700 mb-2 flex items-center gap-1">
                  <Sparkles size={12} />
                  <strong>2º e 3º estilo:</strong>
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateField('musicStyle2', formData.musicStyle)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${formData.musicStyle2 === formData.musicStyle ? 'bg-purple-500 text-white' : 'bg-white border border-purple-200 text-purple-700'}`}>
                    Mesmo estilo
                  </button>
                  <select
                    value={formData.musicStyle2 !== formData.musicStyle ? formData.musicStyle2 : ''}
                    onChange={(e) => updateField('musicStyle2', e.target.value || formData.musicStyle)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border ${formData.musicStyle2 && formData.musicStyle2 !== formData.musicStyle ? 'bg-purple-500 text-white border-purple-500' : 'bg-white border-purple-200 text-purple-700'}`}
                  >
                    <option value="">Outro estilo...</option>
                    {MUSIC_STYLES.filter(s => s.value !== formData.musicStyle).map((style) => (
                      <option key={style.value} value={style.value}>{style.emoji} {style.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><Mic2 size={16} className="text-violet-500" />Qual voz você prefere?</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => updateField('voicePreference', 'feminina')} className={`p-2 rounded-xl border-2 text-center active:scale-95 ${formData.voicePreference === 'feminina' ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-gray-200'}`}><span className="text-xl block">👩‍🎤</span><span className={`font-bold text-xs block mt-1 ${formData.voicePreference === 'feminina' ? 'text-pink-600' : 'text-gray-600'}`}>Feminina</span></button>
                <button type="button" onClick={() => updateField('voicePreference', 'masculina')} className={`p-2 rounded-xl border-2 text-center active:scale-95 ${formData.voicePreference === 'masculina' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200'}`}><span className="text-xl block">👨‍🎤</span><span className={`font-bold text-xs block mt-1 ${formData.voicePreference === 'masculina' ? 'text-blue-600' : 'text-gray-600'}`}>Masculina</span></button>
                <button type="button" onClick={() => updateField('voicePreference', 'sem_preferencia')} className={`p-2 rounded-xl border-2 text-center active:scale-95 ${formData.voicePreference === 'sem_preferencia' ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200'}`}><span className="text-xl block">🎵</span><span className={`font-bold text-xs block mt-1 ${formData.voicePreference === 'sem_preferencia' ? 'text-violet-600' : 'text-gray-600'}`}>Tanto faz</span></button>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 2 - SUA HISTÓRIA */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeInUp">
            <div className="bg-violet-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center text-white text-lg">{RELATIONSHIPS.find(r => r.value === formData.relationship)?.emoji}</div>
              <div><p className="font-bold text-gray-900 text-sm">{formData.honoreeName}</p><p className="text-xs text-gray-500">{OCCASIONS.find(o => o.value === formData.occasion)?.label} • {MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}</p></div>
            </div>
            <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2.5 flex items-start gap-2">
              <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600/80 leading-relaxed">Você cria e edita a letra aqui no site. Após aprovar e pagar, sua música será gerada automaticamente em poucos minutos!</p>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><Heart size={16} className="text-violet-500 fill-violet-500" />Conte a história de {formData.honoreeName}</label>
              <p className="text-xs text-gray-500">Quanto mais detalhes, mais especial ficará a música!</p>
              <textarea value={formData.storyAndMessage} onChange={(e) => updateField('storyAndMessage', e.target.value)} rows={4} maxLength={1000} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 resize-none text-sm" placeholder={formData.relationship === 'cha-revelacao' ? 'Ex: Nós nos conhecemos na faculdade, estamos juntos há 5 anos e esse bebê é a realização de um sonho...' : formData.relationship === 'mae' ? 'Ex: Minha mãe sempre foi minha fortaleza. Ela adora cozinhar, é carinhosa e nos criou com muito amor...' : formData.relationship === 'esposo' ? 'Ex: Nos conhecemos no trabalho, ele é atencioso, engraçado e o melhor pai do mundo...' : formData.relationship === 'namorado' ? 'Ex: A gente se conheceu numa festa, foi amor à primeira vista. Ele/ela é carinhoso(a) e me faz rir todos os dias...' : 'Ex: Conte como vocês se conheceram, qualidades da pessoa, momentos especiais, apelidos carinhosos...'} />
              <div className="flex justify-between items-start">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex-1 mr-2"><p className="text-xs text-amber-700"><strong>Dicas:</strong> Como se conheceram, qualidades, memórias marcantes, apelidos carinhosos, o que ela/ele significa pra você</p></div>
                <span className={`text-xs font-medium ${formData.storyAndMessage.length < 20 ? 'text-red-500' : 'text-green-500'}`}>{formData.storyAndMessage.length}/1000</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><Users size={16} className="text-violet-500" />Familiares para mencionar <span className="text-gray-400 font-normal text-xs">(opcional)</span></label>
              <input type="text" value={formData.familyNames} onChange={(e) => updateField('familyNames', e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 text-sm" placeholder="Ex: João (pai), Maria (mãe)" />
            </div>
          </div>
        )}

        {/* PASSO 3 - LETRA */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeInUp">
            {generatingLyrics ? (
              <div className="text-center py-8">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full animate-pulse"></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center"><Music className="text-violet-500 animate-bounce" size={28} /></div>
                  <span className="absolute -top-2 -right-2 text-2xl animate-bounce">🎵</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Criando a letra para {formData.honoreeName}...</h3>
                <p className="text-violet-600 font-medium mb-4">Estamos gerando sua letra para aprovação</p>
                <div className="bg-violet-50 rounded-xl p-4 max-w-sm mx-auto"><div className="flex items-center gap-3"><Loader2 className="animate-spin text-violet-500" size={24} /><p className="text-sm text-gray-700">Nossa IA está compondo versos únicos...</p></div></div>
              </div>
            ) : lyricsError ? (
              <div className="text-center py-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"><p className="text-red-600 text-sm">{lyricsError}</p></div>
                <button type="button" onClick={generateLyrics} className="inline-flex items-center gap-2 px-5 py-2 bg-violet-500 text-white rounded-lg font-bold text-sm"><RefreshCw size={16} />Tentar Novamente</button>
              </div>
            ) : formData.generatedLyrics ? (
              <>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
                  <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Music size={18} className="text-violet-500" /><span className="font-bold text-gray-900 text-sm">Letra para {formData.honoreeName}</span></div><span className="text-xs bg-violet-100 text-violet-600 px-2 py-1 rounded-full">{MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}</span></div>
                  <div className="bg-white rounded-lg p-4 max-h-[200px] overflow-y-auto shadow-inner"><pre className="whitespace-pre-wrap font-sans text-gray-700 text-sm leading-relaxed">{formData.generatedLyrics}</pre></div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={generateLyrics} disabled={generatingLyrics} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-violet-300 text-violet-600 rounded-xl font-bold text-sm"><RefreshCw size={16} />Nova Versão</button>
                  <button type="button" onClick={() => updateField('lyricsApproved', true)} disabled={formData.lyricsApproved} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm ${formData.lyricsApproved ? 'bg-green-500 text-white' : 'bg-violet-500 text-white'}`}><Check size={16} />{formData.lyricsApproved ? 'Aprovada!' : 'Aprovar'}</button>
                </div>
                {formData.lyricsApproved && <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center"><p className="text-green-700 text-sm font-medium flex items-center justify-center gap-2"><Check size={16} />Letra aprovada! Clique em Próximo.</p></div>}
                <details className="border border-gray-200 rounded-xl overflow-hidden"><summary className="px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50 flex items-center gap-2"><Edit3 size={14} />Editar manualmente</summary><div className="p-4 pt-0 border-t"><textarea value={formData.generatedLyrics} onChange={(e) => { updateField('generatedLyrics', e.target.value); updateField('lyricsApproved', false); }} rows={10} className="w-full px-3 py-2 rounded-lg border text-sm font-mono resize-none" /></div></details>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4"><Sparkles className="text-violet-500" size={32} /></div>
                <p className="text-gray-600 mb-4">Clique para gerar sua letra</p>
                <button type="button" onClick={generateLyrics} className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 text-white rounded-xl font-bold"><Sparkles size={18} />Gerar Letra</button>
              </div>
            )}
          </div>
        )}

        {/* PASSO 4 - DADOS E PAGAMENTO */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeInUp">
            {/* Dados de contato */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><User size={16} className="text-violet-500" />Seu nome</label>
                <input type="text" value={formData.userName} onChange={(e) => updateField('userName', e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 text-base" />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><Phone size={16} className="text-violet-500" />WhatsApp</label>
                  <input type="tel" value={formData.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} placeholder="(00) 00000-0000" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 text-base" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><Mail size={16} className="text-violet-500" />E-mail</label>
                  <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="seu@email.com" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 text-base" />
                </div>
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText size={16} className="text-violet-500" />Resumo do pedido</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Plano:</span><span className="font-semibold">{selectedPlan.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Música para:</span><span className="font-semibold">{formData.honoreeName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Ocasião:</span><span className="font-semibold">{OCCASIONS.find(o => o.value === formData.occasion)?.label}</span></div>
                {formData.plan === 'premium' ? (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Estilo 1ª melodia:</span><span className="font-semibold">{MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Estilo 2ª melodia:</span><span className="font-semibold">{MUSIC_STYLES.find(m => m.value === formData.musicStyle2)?.label}</span></div>
                  </>
                ) : (
                  <div className="flex justify-between"><span className="text-gray-500">Estilo:</span><span className="font-semibold">{MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}</span></div>
                )}
                <div className="flex justify-between"><span className="text-gray-500">Músicas:</span><span className="font-semibold">{selectedPlan.melodias}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Entrega:</span><span className="font-semibold">Automática em minutos</span></div>
                <div className="border-t pt-3 mt-3 flex justify-between items-center"><span className="font-bold">Total:</span>
                    <span className="text-2xl font-black text-violet-600">{selectedPlan.priceFormatted}</span>
                </div>
              </div>
            </div>

            {/* Opções de Pagamento */}
            {canProceed() && (
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <Shield size={16} className="text-violet-500" />
                  Escolha a forma de pagamento
                </h4>

                {paymentError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}

                {/* Botão PIX */}
                <button
                  type="button"
                  onClick={handlePixCheckout}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg transition-all"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Processando...</>
                  ) : (
                    <>
                      <svg viewBox="0 0 512 512" className="w-6 h-6 fill-current"><path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z"/></svg>
                      <div className="text-left">
                        <div>Pagar com PIX</div>
                        <div className="text-xs font-normal opacity-80">Aprovação instantânea</div>
                      </div>
                      <span className="ml-auto">{selectedPlan.priceFormatted}</span>
                    </>
                  )}
                </button>

                {/* Separador */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">ou</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Botão Cartão (Mercado Pago) */}
                <button
                  type="button"
                  onClick={handleCardCheckout}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg transition-all"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Processando...</>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      <div className="text-left">
                        <div>Pagar com Cartão</div>
                        <div className="text-xs font-normal opacity-80">Crédito ou Débito — até 12x</div>
                      </div>
                      <span className="ml-auto">{selectedPlan.priceFormatted}</span>
                    </>
                  )}
                </button>

                {/* Badges de segurança */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Lock size={12} className="text-green-500" />
                    <span>Pagamento seguro</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Shield size={12} className="text-violet-500" />
                    <span>Dados protegidos</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navegação */}
        <div className="flex gap-3 pt-6">
          {step > 1 && (
            <button type="button" onClick={prevStep} className="flex items-center justify-center gap-1 px-4 py-3.5 sm:py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 text-sm">
              <ArrowLeft size={16} />Voltar
            </button>
          )}
          {step < totalSteps && (
            <button type="button" onClick={nextStep} disabled={!canProceed() || generatingLyrics} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${canProceed() && !generatingLyrics ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              {generatingLyrics ? <><Loader2 className="animate-spin" size={16} />Gerando...</> : <>Próximo<ArrowRight size={16} /></>}
            </button>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 pt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1"><Shield size={12} className="text-green-500" /><span>Seguro</span></div>
          <div className="flex items-center gap-1"><Clock size={12} className="text-violet-500" /><span>Entrega rápida</span></div>
          <div className="flex items-center gap-1"><Heart size={12} className="text-red-400" /><span>+7.000 clientes</span></div>
        </div>
      </div>
    </div>
  );
}
