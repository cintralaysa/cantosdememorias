// Helper para Upstash QStash — agendamento de polling assíncrono
// Usado para verificar o status da geração de música no Suno
// já que o Vercel tem timeout de 10s e o Suno leva 1-3 minutos

import { Client } from '@upstash/qstash';

let qstashClient: Client | null = null;

function getQStash(): Client {
  if (!qstashClient) {
    const token = process.env.QSTASH_TOKEN;
    if (!token) {
      throw new Error('[QSTASH] QSTASH_TOKEN não configurado');
    }
    qstashClient = new Client({ token });
  }
  return qstashClient;
}

function getBaseUrl(): string {
  // IMPORTANTE: Usar www.cantosdememorias.com.br (nao o bare domain que redireciona 307)
  // VERCEL_URL tem protecao de autenticacao, nao pode ser usado por QStash
  let baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || '').trim();
  if (!baseUrl) {
    return 'https://www.cantosdememorias.com.br';
  }
  if (!baseUrl.startsWith('http')) {
    baseUrl = `https://${baseUrl}`;
  }
  // Garantir que usa www para evitar redirect 307
  return baseUrl.replace('://cantosdememorias.com.br', '://www.cantosdememorias.com.br');
}

// Agendar geração de música via QStash (mais confiável que fire-and-forget fetch)
export async function scheduleGeneration(orderId: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const internalSecret = process.env.INTERNAL_API_SECRET;
  const url = `${baseUrl}/api/music/generate`;

  console.log(`[QSTASH] Agendando geração para ${orderId} → ${url}`);

  const headers: Record<string, string> = {};
  if (internalSecret) {
    headers['x-internal-secret'] = internalSecret.trim();
  }

  await getQStash().publishJSON({
    url,
    body: { orderId },
    headers,
    retries: 3,
  });

  console.log(`[QSTASH] Geração agendada com sucesso para ${orderId}`);
}

// Agendar verificação de status da música
export async function scheduleStatusPoll(orderId: string, delaySeconds: number = 10): Promise<void> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/music/poll`;

  console.log(`[QSTASH] Agendando poll para ${orderId} em ${delaySeconds}s → ${url}`);

  await getQStash().publishJSON({
    url,
    body: { orderId },
    delay: delaySeconds,
    retries: 3,
  });

  console.log(`[QSTASH] Poll agendado com sucesso para ${orderId}`);
}
