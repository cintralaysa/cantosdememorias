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

// Agendar verificação de status da música
export async function scheduleStatusPoll(orderId: string, delaySeconds: number = 10): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error('[QSTASH] NEXT_PUBLIC_BASE_URL não configurado');
  }

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
