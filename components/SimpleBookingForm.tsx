"use client";

import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import { Service } from '@/lib/data';
import { ArrowRight, ArrowLeft, Loader2, Lock, Heart, Music, Sparkles, Check, Shield, Clock, FileText, RefreshCw, Edit3, X, User, Phone, Mail, Users, Mic2, CreditCard, Copy, CheckCircle } from 'lucide-react';

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

interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  identificationType: string;
  identificationNumber: string;
  installments: number;
}

interface PixData {
  qrCode: string;
  qrCodeBase64: string;
  paymentId: string;
}

interface SimpleBookingFormProps {
  service: Service;
  onClose?: () => void;
  isModal?: boolean;
}

declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function SimpleBookingForm({ service, onClose, isModal = false }: SimpleBookingFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState('');

  // Estados do pagamento
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | null>(null);
  const [mpReady, setMpReady] = useState(false);
  const [mp, setMp] = useState<any>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [cardForm, setCardForm] = useState<CardFormData>({
    cardNumber: '',
    cardholderName: '',
    expirationMonth: '',
    expirationYear: '',
    securityCode: '',
    identificationType: 'CPF',
    identificationNumber: '',
    installments: 1,
  });

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

  // Inicializar Mercado Pago SDK
  const initMercadoPago = useCallback(() => {
    if (window.MercadoPago && !mp) {
      const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
      if (publicKey) {
        const mpInstance = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
        setMp(mpInstance);
        setMpReady(true);
      }
    }
  }, [mp]);

  // Verificar pagamento PIX
  const checkPixPayment = useCallback(async () => {
    if (!pixData?.paymentId) return;
    setCheckingPayment(true);
    try {
      const response = await fetch(`/api/mercadopago/check-payment?payment_id=${pixData.paymentId}`);
      const data = await response.json();
      if (data.status === 'approved') {
        setPaymentSuccess(true);
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
    } finally {
      setCheckingPayment(false);
    }
  }, [pixData]);

  // Polling para verificar pagamento PIX
  useEffect(() => {
    if (pixData && !paymentSuccess) {
      const interval = setInterval(checkPixPayment, 5000);
      return () => clearInterval(interval);
    }
  }, [pixData, paymentSuccess, checkPixPayment]);

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
        return formData.relationship && formData.honoreeName.trim().length >= 2 && formData.occasion && formData.musicStyle;
      case 2:
        return formData.storyAndMessage.trim().length >= 20;
      case 3:
        return formData.lyricsApproved && formData.generatedLyrics.trim().length > 0;
      case 4:
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
      if (step === 2 && !formData.generatedLyrics) {
        await generateLyrics();
      }
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Formatar número do cartão
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(' ').substr(0, 19) : '';
  };

  // Formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return numbers.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  // Copiar código PIX
  const copyPixCode = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    }
  };

  // Redirecionar para checkout Cakto
  const handleCaktoCheckout = async () => {
    if (!canProceed()) return;
    setLoading(true);
    setPaymentError(null);

    try {
      // Preparar dados do pedido
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
        familyNames: formData.familyNames,
        generatedLyrics: formData.generatedLyrics,
        knowsBabySex: formData.knowsBabySex,
        babySex: formData.babySex,
        babyNameBoy: formData.babyNameBoy,
        babyNameGirl: formData.babyNameGirl,
      };

      // Salvar pedido e obter URL do checkout
      const response = await fetch('/api/cakto/save-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.checkoutUrl) {
        // Redirecionar para o checkout da Cakto
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Erro ao gerar link de pagamento');
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Erro ao processar. Tente novamente.');
      setLoading(false);
    }
  };

  // Processar pagamento PIX
  const handlePixPayment = async () => {
    if (!canProceed()) return;
    setLoading(true);
    setPaymentError(null);

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'pix',
          amount: service.price,
          description: `Música personalizada para ${formData.honoreeName}`,
          payer: {
            email: formData.email,
            first_name: formData.userName.split(' ')[0],
            last_name: formData.userName.split(' ').slice(1).join(' ') || formData.userName.split(' ')[0],
          },
          orderData: {
            orderId,
            amount: service.price,
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
            qualities: formData.storyAndMessage,
            memories: formData.storyAndMessage,
            heartMessage: formData.storyAndMessage,
            familyNames: formData.familyNames,
            approvedLyrics: formData.generatedLyrics,
            knowsBabySex: formData.knowsBabySex,
            babySex: formData.babySex,
            babyNameBoy: formData.babyNameBoy,
            babyNameGirl: formData.babyNameGirl,
          },
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (data.pixQrCode && data.pixQrCodeBase64) {
        setPixData({ qrCode: data.pixQrCode, qrCodeBase64: data.pixQrCodeBase64, paymentId: data.paymentId });
      } else {
        throw new Error('Erro ao gerar QR Code PIX');
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Erro ao processar pagamento PIX');
    } finally {
      setLoading(false);
    }
  };

  // Processar pagamento com cartão
  const handleCardPayment = async () => {
    if (!canProceed() || !mp) return;
    setLoading(true);
    setPaymentError(null);

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const cardTokenData = {
        cardNumber: cardForm.cardNumber.replace(/\s/g, ''),
        cardholderName: cardForm.cardholderName,
        cardExpirationMonth: cardForm.expirationMonth,
        cardExpirationYear: cardForm.expirationYear,
        securityCode: cardForm.securityCode,
        identificationType: cardForm.identificationType,
        identificationNumber: cardForm.identificationNumber.replace(/[^\d]/g, ''),
      };

      const tokenResponse = await mp.createCardToken(cardTokenData);
      if (tokenResponse.error) throw new Error(tokenResponse.error);

      const response = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'card',
          token: tokenResponse.id,
          amount: service.price,
          installments: cardForm.installments,
          description: `Música personalizada para ${formData.honoreeName}`,
          payer: {
            email: formData.email,
            first_name: formData.userName.split(' ')[0],
            last_name: formData.userName.split(' ').slice(1).join(' ') || formData.userName.split(' ')[0],
            identification: {
              type: cardForm.identificationType,
              number: cardForm.identificationNumber.replace(/[^\d]/g, ''),
            },
          },
          orderData: {
            orderId,
            amount: service.price,
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
            qualities: formData.storyAndMessage,
            memories: formData.storyAndMessage,
            heartMessage: formData.storyAndMessage,
            familyNames: formData.familyNames,
            approvedLyrics: formData.generatedLyrics,
            knowsBabySex: formData.knowsBabySex,
            babySex: formData.babySex,
            babyNameBoy: formData.babyNameBoy,
            babyNameGirl: formData.babyNameGirl,
          },
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (data.status === 'approved') {
        setPaymentSuccess(true);
      } else if (data.status === 'in_process' || data.status === 'pending') {
        setPaymentError('Pagamento em análise. Você receberá uma confirmação por e-mail.');
      } else {
        throw new Error(data.statusDetail || 'Pagamento não aprovado');
      }
    } catch (error: any) {
      setPaymentError(error.message || 'Erro ao processar pagamento');
    } finally {
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
          <p className="text-sm text-violet-700">Você receberá sua música em até <strong>24 horas</strong> no e-mail e WhatsApp cadastrados.</p>
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
    <>
      <Script src="https://sdk.mercadopago.com/js/v2" onLoad={initMercadoPago} />

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
                <span className="text-xs text-white/60 block">Apenas</span>
                <span className="text-xl font-black text-white">R$ {service.price.toFixed(2).replace('.', ',')}</span>
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

          {/* PASSO 1 */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeInUp">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <Heart size={16} className="text-violet-500" />
                  Para quem é essa música?
                </label>
                <div className="grid grid-cols-4 gap-2">
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
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Você já sabe o sexo do bebê?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => { updateField('knowsBabySex', 'sim'); updateField('babySex', ''); }} className={`p-3 rounded-xl border-2 text-center ${formData.knowsBabySex === 'sim' ? 'border-pink-500 bg-pink-100' : 'border-gray-200'}`}><span className="text-lg block">✅</span><span className="font-bold text-xs">Sim, já sei!</span></button>
                      <button type="button" onClick={() => { updateField('knowsBabySex', 'nao'); updateField('babySex', ''); }} className={`p-3 rounded-xl border-2 text-center ${formData.knowsBabySex === 'nao' ? 'border-violet-500 bg-violet-100' : 'border-gray-200'}`}><span className="text-lg block">🎁</span><span className="font-bold text-xs">É surpresa!</span></button>
                    </div>
                  </div>
                  {formData.knowsBabySex === 'sim' && (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-700">Qual o sexo?</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => { updateField('babySex', 'menino'); updateField('babyNameGirl', ''); }} className={`p-3 rounded-xl border-2 ${formData.babySex === 'menino' ? 'border-blue-500 bg-blue-100' : 'border-gray-200'}`}><span className="text-xl">💙</span><span className="font-bold text-xs block">Menino</span></button>
                        <button type="button" onClick={() => { updateField('babySex', 'menina'); updateField('babyNameBoy', ''); }} className={`p-3 rounded-xl border-2 ${formData.babySex === 'menina' ? 'border-pink-500 bg-pink-100' : 'border-gray-200'}`}><span className="text-xl">💖</span><span className="font-bold text-xs block">Menina</span></button>
                      </div>
                      {formData.babySex && (
                        <div><label className="block text-xs font-bold text-gray-700 mb-1">Nome do bebê</label><input type="text" value={formData.babySex === 'menino' ? formData.babyNameBoy : formData.babyNameGirl} onChange={(e) => updateField(formData.babySex === 'menino' ? 'babyNameBoy' : 'babyNameGirl', e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 text-sm" /></div>
                      )}
                    </div>
                  )}
                  {formData.knowsBabySex === 'nao' && (
                    <div className="space-y-3">
                      <p className="text-xs text-violet-700 bg-violet-100 p-2 rounded-lg">Criaremos uma música com suspense e dois finais!</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="block text-xs font-bold text-blue-600 mb-1">💙 Se for menino</label><input type="text" value={formData.babyNameBoy} onChange={(e) => updateField('babyNameBoy', e.target.value)} className="w-full px-3 py-2 rounded-xl border-2 border-blue-200 text-sm" /></div>
                        <div><label className="block text-xs font-bold text-pink-600 mb-1">💖 Se for menina</label><input type="text" value={formData.babyNameGirl} onChange={(e) => updateField('babyNameGirl', e.target.value)} className="w-full px-3 py-2 rounded-xl border-2 border-pink-200 text-sm" /></div>
                      </div>
                    </div>
                  )}
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
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><Music size={16} className="text-violet-500" />Qual estilo musical?</label>
                <div className="grid grid-cols-3 gap-2">
                  {MUSIC_STYLES.map((style) => (
                    <button key={style.value} type="button" onClick={() => updateField('musicStyle', style.value)} className={`p-2 rounded-xl border-2 text-center active:scale-95 ${formData.musicStyle === style.value ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200'}`}>
                      <span className="text-lg block">{style.emoji}</span>
                      <span className={`font-medium text-[9px] block mt-1 ${formData.musicStyle === style.value ? 'text-violet-600' : 'text-gray-600'}`}>{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

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

          {/* PASSO 2 */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeInUp">
              <div className="bg-violet-50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center text-white text-lg">{RELATIONSHIPS.find(r => r.value === formData.relationship)?.emoji}</div>
                <div><p className="font-bold text-gray-900 text-sm">{formData.honoreeName}</p><p className="text-xs text-gray-500">{OCCASIONS.find(o => o.value === formData.occasion)?.label} • {MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}</p></div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><Heart size={16} className="text-violet-500 fill-violet-500" />Conte a história de {formData.honoreeName}</label>
                <p className="text-xs text-gray-500">Quanto mais detalhes, mais especial ficará a música!</p>
                <textarea value={formData.storyAndMessage} onChange={(e) => updateField('storyAndMessage', e.target.value)} rows={6} maxLength={1000} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 resize-none text-sm" />
                <div className="flex justify-between items-start">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex-1 mr-2"><p className="text-xs text-amber-700"><strong>Dicas:</strong> Qualidades, memórias, apelidos carinhosos...</p></div>
                  <span className={`text-xs font-medium ${formData.storyAndMessage.length < 20 ? 'text-red-500' : 'text-green-500'}`}>{formData.storyAndMessage.length}/1000</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800"><Users size={16} className="text-violet-500" />Familiares para mencionar <span className="text-gray-400 font-normal text-xs">(opcional)</span></label>
                <input type="text" value={formData.familyNames} onChange={(e) => updateField('familyNames', e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 text-sm" placeholder="Ex: João (pai), Maria (mãe)" />
              </div>
            </div>
          )}

          {/* PASSO 3 */}
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

          {/* PASSO 4 - PAGAMENTO INTEGRADO */}
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
                  <div className="flex justify-between"><span className="text-gray-500">Música para:</span><span className="font-semibold">{formData.honoreeName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Ocasião:</span><span className="font-semibold">{OCCASIONS.find(o => o.value === formData.occasion)?.label}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Estilo:</span><span className="font-semibold">{MUSIC_STYLES.find(m => m.value === formData.musicStyle)?.label}</span></div>
                  <div className="border-t pt-3 mt-3 flex justify-between items-center"><span className="font-bold">Total:</span><span className="text-2xl font-black text-violet-600">R$ {service.price.toFixed(2).replace('.', ',')}</span></div>
                </div>
              </div>

              {/* Botão de Finalizar - Redireciona para Cakto */}
              {canProceed() && !paymentSuccess && (
                <div className="space-y-4">
                  {/* Métodos de pagamento disponíveis */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Lock size={16} className="text-violet-500" />Formas de pagamento</h4>
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg viewBox="0 0 512 512" className="w-6 h-6 fill-green-500"><path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z"/></svg>
                        <span className="font-semibold text-green-600">PIX</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard className="w-6 h-6 text-violet-500" />
                        <span className="font-semibold">Cartão até 12x</span>
                      </div>
                    </div>
                  </div>

                  {paymentError && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{paymentError}</div>}

                  {/* Botão Finalizar */}
                  <button
                    type="button"
                    onClick={handleCaktoCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" />Processando...</>
                    ) : (
                      <><Shield size={20} />Finalizar Pedido - R$ {service.price.toFixed(2).replace('.', ',')}</>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500">
                    Você será redirecionado para a página de pagamento seguro
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navegação */}
          <div className="flex gap-3 pt-6">
            {step > 1 && !pixData && (
              <button type="button" onClick={prevStep} className="flex items-center justify-center gap-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 text-sm">
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
            <div className="flex items-center gap-1"><Clock size={12} className="text-violet-500" /><span>Entrega 24h</span></div>
            <div className="flex items-center gap-1"><Heart size={12} className="text-red-400" /><span>+2.000 clientes</span></div>
          </div>
        </div>
      </div>
    </>
  );
}
