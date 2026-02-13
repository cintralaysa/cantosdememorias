export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  priceInCents: number;
  image: string;
  features: string[];
  highlight?: string;
  audioSample?: string;
  type: "music" | "voiceover";
  plan: "basico" | "premium";
  melodias: number;
  deliveryHours: number;
}

export const SERVICES: Service[] = [
  {
    id: "1",
    slug: "musica-personalizada-basico",
    title: "Plano Básico",
    description: "Uma melodia exclusiva com letra personalizada para eternizar seu momento especial.",
    price: 59.90,
    priceInCents: 5990,
    image: "/portfolio/fotos/cantor-estudio.png",
    features: ["1 Melodia exclusiva", "Letra personalizada", "Entrega em até 48 horas", "Aprove a letra antes de pagar"],
    highlight: "EXCLUSIVO SITE",
    audioSample: "https://cdn1.suno.ai/eb315faa-63eb-4fa3-885f-9dd2421027d0.mp3",
    type: "music",
    plan: "basico",
    melodias: 1,
    deliveryHours: 48
  },
  {
    id: "2",
    slug: "musica-personalizada-premium",
    title: "Plano Premium",
    description: "Duas melodias diferentes da mesma letra, com entrega no mesmo dia.",
    price: 79.90,
    priceInCents: 7990,
    image: "/portfolio/fotos/cantor-estudio.png",
    features: ["2 Melodias diferentes", "Letra personalizada", "Entrega no mesmo dia", "Aprove a letra antes de pagar"],
    highlight: "MELHOR VALOR",
    audioSample: "https://cdn1.suno.ai/eb315faa-63eb-4fa3-885f-9dd2421027d0.mp3",
    type: "music",
    plan: "premium",
    melodias: 2,
    deliveryHours: 0
  }
];

export const TESTIMONIALS = [
  {
    name: "Ana Cláudia",
    role: "Homenagem de 15 anos",
    text: "Eu contei a história da minha filha e eles transformaram em uma música que nos fez chorar de alegria. Foi o momento mais emocionante da festa inteira!",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Beatriz Santos",
    role: "Presente de Namoro",
    text: "Meu namorado chorou quando ouviu. Cada detalhe que eu falei estava na letra. O melhor presente que já dei na vida!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Juliana Paiva",
    role: "Chá Revelação",
    text: "A música do nosso chá revelação foi PERFEITA! Todos choraram quando revelamos que seria uma menina. Momento inesquecível!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Carolina Mendes",
    role: "Homenagem ao Pai",
    text: "Perdi meu pai há 2 anos e encomendei uma música em sua homenagem. Chorei do início ao fim, mas foi uma forma linda de eternizar a memória dele.",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Fernanda Lima",
    role: "Mesversário do Bebê",
    text: "Todo mês encomendo uma música para o mesversário do meu filho. É o presente mais especial que posso dar pra ele quando crescer!",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Mariana Costa",
    role: "Casamento",
    text: "A música que fizeram para nossa cerimônia deixou todos os convidados emocionados. Meu marido não conseguiu segurar as lágrimas. AMAMOS!",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  }
];