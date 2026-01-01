'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

// ID do Pixel do Meta - Substitua pelo seu ID real
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

// Declarar fbq para TypeScript
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

// Função para disparar eventos do Pixel
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

// Eventos pré-definidos úteis para e-commerce
export const MetaPixelEvents = {
  // Quando alguém visualiza uma página de produto/serviço
  viewContent: (params: { content_name: string; content_category?: string; value?: number; currency?: string }) => {
    trackEvent('ViewContent', {
      ...params,
      currency: params.currency || 'BRL',
    });
  },

  // Quando alguém inicia o processo de checkout
  initiateCheckout: (params: { value: number; currency?: string; content_name?: string }) => {
    trackEvent('InitiateCheckout', {
      ...params,
      currency: params.currency || 'BRL',
    });
  },

  // Quando alguém adiciona informações de pagamento
  addPaymentInfo: (params: { value: number; currency?: string }) => {
    trackEvent('AddPaymentInfo', {
      ...params,
      currency: params.currency || 'BRL',
    });
  },

  // Quando uma compra é concluída
  purchase: (params: { value: number; currency?: string; content_name?: string; content_ids?: string[] }) => {
    trackEvent('Purchase', {
      ...params,
      currency: params.currency || 'BRL',
    });
  },

  // Quando alguém se inscreve/cadastra
  lead: (params?: { content_name?: string; value?: number }) => {
    trackEvent('Lead', params);
  },

  // Quando alguém entra em contato
  contact: () => {
    trackEvent('Contact');
  },

  // Evento customizado
  custom: (eventName: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, params);
    }
  },
};

// Componente que rastreia mudanças de página
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return null;
}

// Componente principal do Meta Pixel
export default function MetaPixel() {
  // Não renderiza se não tiver Pixel ID
  if (!PIXEL_ID) {
    return null;
  }

  return (
    <>
      {/* Script de inicialização do Pixel */}
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />

      {/* Fallback noscript para usuários sem JavaScript */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>

      {/* Rastreador de PageView para navegação SPA */}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
