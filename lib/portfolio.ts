// Tipos para o portfólio
export interface PortfolioItem {
  id: string;
  type: 'music' | 'voiceover';
  title: string;
  description: string;
  occasion: string;
  audioUrl: string;
  imageUrl?: string;
  clientName?: string;
  relationship?: string;
  createdAt: string;
  featured?: boolean;
}

// ================================================================
// MÚSICAS DO PORTFÓLIO - CANTOS DE MEMÓRIAS
// ================================================================

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: '1',
    type: 'music',
    title: 'Melodia do Coração',
    description: 'Uma canção que celebra os laços familiares e o amor que nos conecta',
    occasion: 'Família',
    audioUrl: 'https://cdn1.suno.ai/9ceddcf0-d6ce-4c65-8c7c-7657a72c2a09.mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_czgkh4czgkh4czgk.png',
    clientName: 'Família Unida',
    relationship: 'Família',
    createdAt: '2024-12-20',
    featured: true,
  },
  {
    id: '2',
    type: 'music',
    title: 'Amor em Canção',
    description: 'Jingle natalino personalizado para encantar clientes e criar clima de Natal na sua loja',
    occasion: 'Natal Comercial',
    audioUrl: 'https://cdn1.suno.ai/dacadb35-714f-48da-a30c-91df69c8c02a.mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_bzavwlbzavwlbzav.png',
    clientName: 'Loja Cliente',
    relationship: 'Jingle Comercial',
    createdAt: '2024-12-18',
    featured: true,
  },
  {
    id: '3',
    type: 'music',
    title: 'Memórias Eternas',
    description: 'Homenagem emocionante em memória do pequeno Bento, eternizando seu amor e luz',
    occasion: 'Homenagem Póstuma',
    audioUrl: 'https://cdn1.suno.ai/78c55bc2-d441-42b3-aa48-dbb513b3a3a9.mp3',
    imageUrl: '/portfolio/fotos/unnamed-memorias-eternas.jpg',
    clientName: 'Família do Bento',
    relationship: 'Família → Bento',
    createdAt: '2024-12-15',
    featured: true,
  },
  {
    id: '4',
    type: 'music',
    title: 'Chá Revelação',
    description: 'O momento mágico da descoberta: menino ou menina? Uma música para o chá revelação',
    occasion: 'Chá Revelação',
    audioUrl: 'https://cdn1.suno.ai/eb315faa-63eb-4fa3-885f-9dd2421027d0.mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_siy9uysiy9uysiy9.png',
    clientName: 'Papai e Mamãe',
    relationship: 'Pais → Bebê',
    createdAt: '2024-12-10',
    featured: true,
  },
  {
    id: '5',
    type: 'music',
    title: 'Presente Musical',
    description: 'O amor de mãe em forma de música - uma canção especial de mãe para filho',
    occasion: 'Dia das Mães',
    audioUrl: 'https://cdn1.suno.ai/d524dc72-7958-4aa1-899f-0250effe668b.mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_ct6qvxct6qvxct6q.png',
    clientName: 'Mãe Amorosa',
    relationship: 'Mãe → Filho',
    createdAt: '2024-12-08',
    featured: true,
  },
  {
    id: '6',
    type: 'music',
    title: 'Dezenove de Outubro',
    description: 'Primeiro aninho de vida! Uma música para celebrar esse marco especial',
    occasion: 'Aniversário 1 Ano',
    audioUrl: 'https://cdn1.suno.ai/836acf7a-1447-4324-a008-549aa9e33cf3.mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_yx5imgyx5imgyx5i.png',
    clientName: 'Família Comemorando',
    relationship: 'Pais → Filho',
    createdAt: '2024-10-19',
    featured: true,
  },
  {
    id: '7',
    type: 'music',
    title: 'Tudo Completo',
    description: 'A família reunida em uma só canção - celebrando o amor que nos une',
    occasion: 'Família',
    audioUrl: 'https://cdn1.suno.ai/97ddf954-f4b3-4583-9a48-5a5c30b47ca7.mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_dkfj25dkfj25dkfj.png',
    clientName: 'Família Unida',
    relationship: 'Família',
    createdAt: '2024-12-05',
    featured: true,
  },
  {
    id: '8',
    type: 'music',
    title: 'O Tempo Voou',
    description: 'Mais um mês da pequena Isabela! Celebrando cada momento do seu crescimento',
    occasion: 'Mesversário',
    audioUrl: 'https://cdn1.suno.ai/79821520-a8ef-4f5a-9b5f-8b876f0cdbe6.mp3',
    imageUrl: '/portfolio/fotos/unnamed.jpg',
    clientName: 'Família da Isabela',
    relationship: 'Pais → Isabela',
    createdAt: '2024-12-01',
    featured: true,
  },

  // ================================================================
  // LOCUÇÕES DO PORTFÓLIO
  // ================================================================
  {
    id: '9',
    type: 'voiceover',
    title: 'Locução Comercial',
    description: 'Locução profissional para propaganda comercial com voz impactante e persuasiva',
    occasion: 'Propaganda',
    audioUrl: '/portfolio/audios/locucao-propaganda-1.mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_qr4qhdqr4qhdqr4q.png',
    clientName: 'Cliente Comercial',
    relationship: 'Propaganda',
    createdAt: '2024-11-30',
    featured: true,
  },
  {
    id: '11',
    type: 'voiceover',
    title: 'Narração Leonardo',
    description: 'Narração com voz masculina marcante, ideal para vídeos e apresentações',
    occasion: 'Narração',
    audioUrl: '/portfolio/audios/ElevenLabs_2025-12-02T19_43_07_Leonardo Hamaral_pvc_sp100_s50_sb75_v3 (1).mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_qr4qhdqr4qhdqr4q.png',
    clientName: 'Leonardo Hamaral',
    relationship: 'Narração',
    createdAt: '2024-12-02',
    featured: true,
  },
  {
    id: '12',
    type: 'voiceover',
    title: 'Voz Corporativa',
    description: 'Locução corporativa clara e objetiva para comunicação empresarial',
    occasion: 'Corporativo',
    audioUrl: '/portfolio/audios/ElevenLabs_2025-12-02T19_58_20_Leonardo Hamaral_pvc_sp100_s50_sb75_v3.mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_qr4qhdqr4qhdqr4q.png',
    clientName: 'Cliente Corporativo',
    relationship: 'Corporativo',
    createdAt: '2024-12-02',
    featured: true,
  },
  {
    id: '13',
    type: 'voiceover',
    title: 'Voz Criativa',
    description: 'Locução com estilo único e criativo para projetos diferenciados',
    occasion: 'Criativo',
    audioUrl: '/portfolio/audios/ElevenLabs_2025-12-02T19_59_54_Dr. Von Fusion VF – Quirky Mad Scientist_pvc_sp100_s30_sb90_v3.mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_qr4qhdqr4qhdqr4q.png',
    clientName: 'Projeto Especial',
    relationship: 'Criativo',
    createdAt: '2024-12-02',
    featured: true,
  },
];

// Funções auxiliares
export function getFeaturedItems(): PortfolioItem[] {
  return PORTFOLIO_ITEMS.filter(item => item.featured);
}

export function getMusicItems(): PortfolioItem[] {
  return PORTFOLIO_ITEMS.filter(item => item.type === 'music');
}

export function getVoiceoverItems(): PortfolioItem[] {
  return PORTFOLIO_ITEMS.filter(item => item.type === 'voiceover');
}

export function getItemById(id: string): PortfolioItem | undefined {
  return PORTFOLIO_ITEMS.find(item => item.id === id);
}
