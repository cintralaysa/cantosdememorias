// Cliente da API Suno via sunoapi.org
// Docs: https://docs.sunoapi.org/
// Endpoint correto: POST /api/v1/generate com customMode: true
// Status: GET /api/v1/generate/record-info?taskId=XXX

const SUNO_API_BASE = (process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org').trim();
const SUNO_API_KEY = (process.env.SUNO_API_KEY || '').trim();

export interface SunoGenerationRequest {
  title: string;
  lyrics: string;
  style: string;
  callbackUrl?: string;
}

export interface SunoAudioResult {
  id: string;
  audioUrl: string;
  imageUrl?: string;
  title?: string;
  duration?: number;
}

// Submeter geração de música com letras customizadas
// Retorna 1 taskId (cada task gera 2 variações de áudio)
export async function submitGeneration(params: SunoGenerationRequest): Promise<string> {
  if (!SUNO_API_KEY) {
    throw new Error('[SUNO] SUNO_API_KEY não configurada');
  }

  console.log(`[SUNO] Submetendo geração: "${params.title}" | estilo: ${params.style}`);

  // Callback URL obrigatoria pela API do sunoapi.org
  // Usar www. para evitar redirect 307 que quebra callbacks
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.cantosdememorias.com.br').trim()
    .replace('://cantosdememorias.com.br', '://www.cantosdememorias.com.br');
  const callbackUrl = params.callbackUrl || `${baseUrl}/api/music/callback`;

  const body: Record<string, any> = {
    customMode: true,
    instrumental: false,
    title: params.title,
    prompt: params.lyrics,
    style: params.style,
    model: 'V4_5',
    callBackUrl: callbackUrl,
  };

  const response = await fetch(`${SUNO_API_BASE}/api/v1/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[SUNO] Erro na API: ${response.status}`, errorText);
    throw new Error(`Suno API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[SUNO] Resposta:', JSON.stringify(data));

  if (data.code !== 200) {
    throw new Error(`[SUNO] Erro: ${data.msg || JSON.stringify(data)}`);
  }

  const taskId = data.data?.taskId;
  if (!taskId) {
    throw new Error('[SUNO] Nenhum taskId retornado pela API');
  }

  console.log(`[SUNO] Task criada: ${taskId}`);
  return taskId;
}

// Verificar status de uma task via record-info
export async function checkTaskStatus(taskId: string): Promise<{
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audios: SunoAudioResult[];
  error?: string;
}> {
  if (!SUNO_API_KEY) {
    throw new Error('[SUNO] SUNO_API_KEY não configurada');
  }

  console.log(`[SUNO] Verificando status: ${taskId}`);

  const response = await fetch(`${SUNO_API_BASE}/api/v1/generate/record-info?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[SUNO] Erro status: ${response.status}`, errorText);
    throw new Error(`Suno status error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[SUNO] Record-info:', JSON.stringify(data).substring(0, 1000));

  if (!data.data) {
    console.log('[SUNO] data.data é null/undefined, retornando pending');
    return { status: 'pending', audios: [] };
  }

  const record = data.data;
  const rawStatus = record.status || '';
  const status = normalizeRecordStatus(rawStatus);
  const audios: SunoAudioResult[] = [];

  console.log(`[SUNO] rawStatus="${rawStatus}" → normalized="${status}"`);
  console.log(`[SUNO] record.response exists: ${!!record.response}, type: ${typeof record.response}`);

  // Se response for string, tentar parsear
  let responseObj = record.response;
  if (typeof responseObj === 'string') {
    try {
      responseObj = JSON.parse(responseObj);
      console.log('[SUNO] record.response era string, parseado com sucesso');
    } catch {
      console.error('[SUNO] record.response era string mas falhou ao parsear');
      responseObj = null;
    }
  }

  // Extrair áudios de múltiplos caminhos possíveis
  const sunoData = responseObj?.sunoData || responseObj?.data || responseObj?.clips || [];
  console.log(`[SUNO] sunoData encontrado: ${Array.isArray(sunoData) ? sunoData.length : 'não é array'} itens`);

  if (Array.isArray(sunoData)) {
    for (const item of sunoData) {
      // Priorizar stream_audio_url (CDN direto, ex: cdn1.suno.ai/xxx.mp3) que funciona com <audio>
      // audio_url pode ser URL de pipeline (audiopipe.suno.ai) que não reproduz bem no browser
      const audioUrl = item.stream_audio_url || item.audio_url || item.audioUrl || '';
      if (audioUrl) {
        audios.push({
          id: item.id || taskId,
          audioUrl,
          imageUrl: item.image_url || item.imageUrl,
          title: item.title,
          duration: item.duration,
        });
      }
    }
  }

  // Se status é completed mas não encontrou áudios, logar detalhes para debug
  if (status === 'completed' && audios.length === 0) {
    console.warn(`[SUNO] ⚠️ Status=completed mas sem áudios! Keys do record: ${Object.keys(record).join(', ')}`);
    if (responseObj) {
      console.warn(`[SUNO] Keys do response: ${Object.keys(responseObj).join(', ')}`);
    }
  }

  console.log(`[SUNO] Resultado: status=${status}, audios=${audios.length}`);

  return {
    status,
    audios,
    error: record.errorMessage,
  };
}

function normalizeRecordStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
  const s = (status || '').toUpperCase();
  if (s === 'SUCCESS') return 'completed';
  if (s === 'FIRST_SUCCESS' || s === 'TEXT_SUCCESS') return 'processing';
  if (s === 'PENDING') return 'pending';
  if (s.includes('FAILED') || s.includes('ERROR') || s.includes('EXCEPTION')) return 'failed';
  return 'processing';
}

// Verificar créditos restantes
export async function getCredits(): Promise<number> {
  if (!SUNO_API_KEY) return 0;
  try {
    const response = await fetch(`${SUNO_API_BASE}/api/v1/generate/credit`, {
      headers: { 'Authorization': `Bearer ${SUNO_API_KEY}` },
      cache: 'no-store',
    });
    const data = await response.json();
    return data.data || 0;
  } catch {
    return 0;
  }
}
