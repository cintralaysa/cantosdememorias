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
// PORTFÓLIO OTIMIZADO - CANTOS DE MEMÓRIAS
// Apenas os itens selecionados para um site mais enxuto
// ================================================================

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  // MÚSICAS
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
    description: 'O amor transformado em melodia - uma música especial para quem você ama',
    occasion: 'Presente',
    audioUrl: 'https://cdn1.suno.ai/dacadb35-714f-48da-a30c-91df69c8c02a.mp3',
    imageUrl: '/portfolio/fotos/Gemini_Generated_Image_bzavwlbzavwlbzav.png',
    clientName: 'Cliente Especial',
    relationship: 'Casal',
    createdAt: '2024-12-18',
    featured: true,
  },
  {
    id: '3',
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
    id: '4',
    type: 'music',
    title: 'O Tempo Voou',
    description: 'Celebrando cada momento especial do crescimento do seu bebê',
    occasion: 'Mesversário',
    audioUrl: 'https://cdn1.suno.ai/79821520-a8ef-4f5a-9b5f-8b876f0cdbe6.mp3',
    imageUrl: '/portfolio/fotos/unnamed.jpg',
    clientName: 'Família',
    relationship: 'Pais → Bebê',
    createdAt: '2024-12-01',
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
