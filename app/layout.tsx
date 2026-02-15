import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MetaPixel from '@/components/MetaPixel';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // Base URL para resolver imagens de Open Graph
  metadataBase: new URL('https://cantosdememoria.com'),

  // Títulos e descrições otimizadas para SEO e IA
  title: {
    default: 'Como Criar Música Personalizada para Presente? | Cantos de Memórias',
    template: '%s | Cantos de Memórias'
  },
  description: 'Descubra como transformar sua história em uma música personalizada exclusiva. Entrega em até 48h, perfeito para aniversário, casamento, Dia das Mães e datas especiais. A partir de R$59,90.',
  keywords: [
    'música personalizada',
    'presente criativo',
    'música para aniversário',
    'música para casamento',
    'música para dia das mães',
    'música para chá revelação',
    'locução personalizada',
    'presente emocionante',
    'música exclusiva',
    'homenagem musical',
    'como fazer música personalizada',
    'onde encomendar música personalizada',
    'quanto custa música personalizada'
  ],
  authors: [{ name: 'Cantos de Memórias' }],
  creator: 'Cantos de Memórias',
  publisher: 'Cantos de Memórias',

  // Meta tags para IA e buscadores
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Open Graph para redes sociais
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://cantosdememoria.com',
    siteName: 'Cantos de Memórias',
    title: 'Músicas Personalizadas - Transforme Sua História em Melodia | Cantos de Memórias',
    description: 'Crie uma música única e exclusiva para presentear quem você ama. Entrega em até 48h. Perfeito para aniversários, casamentos, Dia das Mães e momentos especiais. A partir de R$59,90.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cantos de Memórias - Músicas Personalizadas',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Músicas Personalizadas - Presente Único e Emocionante',
    description: 'Transforme histórias em músicas exclusivas. Entrega em até 48h. A partir de R$59,90!',
    images: ['/og-image.jpg'],
  },

  // Verificação de sites
  verification: {
    google: 'seu-codigo-google',
  },

  // Alternates
  alternates: {
    canonical: 'https://cantosdememoria.com',
  },

  // Categoria
  category: 'music',

  // Outros
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

// Schema.org JSON-LD para SEO e IA
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://cantosdememoria.com/#organization',
      name: 'Cantos de Memórias',
      url: 'https://cantosdememoria.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cantosdememoria.com/logo.png',
        width: 200,
        height: 60
      },
      description: 'Empresa especializada em criar músicas personalizadas e locuções profissionais para momentos especiais. Transformamos histórias em melodias únicas.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Fortaleza',
        addressRegion: 'CE',
        addressCountry: 'BR'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+55-88-99242-2920',
        contactType: 'customer service',
        availableLanguage: 'Portuguese',
        areaServed: 'BR'
      },
      sameAs: [
        'https://www.instagram.com/cantosdememorias',
        'https://wa.me/5588992422920'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://cantosdememoria.com/#website',
      url: 'https://cantosdememoria.com',
      name: 'Cantos de Memórias',
      description: 'Músicas personalizadas e locuções profissionais para presentear quem você ama',
      publisher: {
        '@id': 'https://cantosdememoria.com/#organization'
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://cantosdememoria.com/busca?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'Service',
      '@id': 'https://cantosdememoria.com/#musica-personalizada',
      name: 'Música Personalizada',
      description: 'Criação de músicas exclusivas e personalizadas para presentear em ocasiões especiais como aniversários, casamentos, Dia das Mães, chá revelação e homenagens.',
      provider: {
        '@id': 'https://cantosdememoria.com/#organization'
      },
      serviceType: 'Criação Musical',
      areaServed: 'BR',
      offers: {
        '@type': 'Offer',
        price: '59.90',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        deliveryLeadTime: {
          '@type': 'QuantitativeValue',
          value: 48,
          unitCode: 'HUR'
        }
      }
    },
    {
      '@type': 'Service',
      '@id': 'https://cantosdememoria.com/#locucao-personalizada',
      name: 'Locução Personalizada',
      description: 'Locuções profissionais personalizadas para propagandas, vídeos institucionais, narrações e projetos especiais.',
      provider: {
        '@id': 'https://cantosdememoria.com/#organization'
      },
      serviceType: 'Locução Profissional',
      areaServed: 'BR',
      offers: {
        '@type': 'Offer',
        price: '47.00',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock'
      }
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://cantosdememoria.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Como funciona a criação de uma música personalizada?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O processo é simples: 1) Você preenche um formulário contando a história e detalhes da pessoa homenageada; 2) Nosso sistema gera uma letra personalizada que você pode aprovar ou editar; 3) Após o pagamento, entregamos sua música em até 48 horas via WhatsApp.'
          }
        },
        {
          '@type': 'Question',
          name: 'Quanto custa uma música personalizada?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Temos dois planos: Básico por R$59,90 (1 melodia, entrega em até 48h) e Premium por R$79,90 (2 melodias, entrega no mesmo dia). Você aprova a letra antes de pagar.'
          }
        },
        {
          '@type': 'Question',
          name: 'Em quanto tempo recebo minha música?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A entrega é feita em até 48 horas após a confirmação do pagamento. Você recebe as músicas diretamente no seu WhatsApp.'
          }
        },
        {
          '@type': 'Question',
          name: 'Posso ver a letra antes de pagar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim! Você vê e aprova a letra gerada antes de fazer o pagamento. Pode solicitar ajustes até ficar satisfeito(a) com o resultado.'
          }
        },
        {
          '@type': 'Question',
          name: 'Para quais ocasiões posso encomendar uma música?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Você pode encomendar músicas para qualquer ocasião especial: aniversários, casamentos, Dia das Mães, Dia dos Pais, Dia dos Namorados, chá revelação, homenagens póstumas, formaturas, bodas, e muito mais.'
          }
        }
      ]
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        {/* Schema.org JSON-LD para SEO e IA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Meta tags adicionais para IA */}
        <meta name="ai-content-type" content="comercial" />
        <meta name="ai-summary" content="Cantos de Memórias cria músicas personalizadas exclusivas para presentes em ocasiões especiais. Entrega em até 48h, a partir de R$59,90. Plano Premium com 2 melodias e entrega no mesmo dia por R$79,90." />
      </head>
      <body className={inter.className}>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}