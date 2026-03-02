// Cliente da API Suno via sunoapi.org
// Docs: https://docs.sunoapi.org/

const SUNO_API_BASE = process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org';
const SUNO_API_KEY = process.env.SUNO_API_KEY || '';

export interface SunoGenerationRequest {
  title: string;
  lyrics: string;
  style: string;
  makeInstrumental?: boolean;
}

export interface SunoTaskResult {
  id: string;
  status: 'submitted' | 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  imageUrl?: string;
  title?: string;
  duration?: number;
  error?: string;
}

// Submeter geração de música com letras customizadas
export async function submitGeneration(params: SunoGenerationRequest): Promise<string[]> {
  if (!SUNO_API_KEY) {
    throw new Error('[SUNO] SUNO_API_KEY não configurada');
  }

  console.log(`[SUNO] Submetendo geração: "${params.title}" | estilo: ${params.style}`);

  const response = await fetch(`${SUNO_API_BASE}/api/custom_generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: params.title,
      prompt: params.lyrics,
      style: params.style,
      make_instrumental: params.makeInstrumental || false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[SUNO] Erro na API: ${response.status}`, errorText);
    throw new Error(`Suno API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[SUNO] Resposta da geração:', JSON.stringify(data));

  // A API retorna task_ids (array de IDs das tasks geradas)
  // Cada geração retorna 2 variações
  const taskIds: string[] = data.task_ids || data.data?.task_ids || [];

  // Alternativa: pode retornar em formato diferente dependendo do provider
  if (taskIds.length === 0 && data.data?.clips) {
    return Object.keys(data.data.clips);
  }

  if (taskIds.length === 0 && data.id) {
    return [data.id];
  }

  if (taskIds.length === 0) {
    throw new Error('[SUNO] Nenhum task_id retornado pela API');
  }

  console.log(`[SUNO] Tasks criadas: ${taskIds.join(', ')}`);
  return taskIds;
}

// Verificar status das tasks
export async function checkStatus(taskIds: string[]): Promise<SunoTaskResult[]> {
  if (!SUNO_API_KEY) {
    throw new Error('[SUNO] SUNO_API_KEY não configurada');
  }

  const idsParam = taskIds.join(',');
  console.log(`[SUNO] Verificando status: ${idsParam}`);

  const response = await fetch(`${SUNO_API_BASE}/api/get?ids=${idsParam}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUNO_API_KEY}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[SUNO] Erro ao verificar status: ${response.status}`, errorText);
    throw new Error(`Suno status check error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[SUNO] Status:', JSON.stringify(data));

  // Normalizar resposta — diferentes providers podem retornar formatos diferentes
  const results: SunoTaskResult[] = [];

  // Formato 1: data.data é array
  if (Array.isArray(data.data)) {
    for (const item of data.data) {
      results.push({
        id: item.id || item.task_id,
        status: normalizeStatus(item.status),
        audioUrl: item.audio_url || item.audioUrl,
        imageUrl: item.image_url || item.imageUrl,
        title: item.title,
        duration: item.duration,
        error: item.error,
      });
    }
  }
  // Formato 2: data.data.clips é objeto
  else if (data.data?.clips) {
    for (const [id, clip] of Object.entries(data.data.clips as Record<string, any>)) {
      results.push({
        id,
        status: normalizeStatus(data.data.status || clip.status),
        audioUrl: clip.audio_url || clip.audioUrl,
        imageUrl: clip.image_url || clip.imageUrl,
        title: clip.title,
        duration: clip.duration,
        error: clip.error,
      });
    }
  }
  // Formato 3: data é array direto
  else if (Array.isArray(data)) {
    for (const item of data) {
      results.push({
        id: item.id || item.task_id,
        status: normalizeStatus(item.status),
        audioUrl: item.audio_url || item.audioUrl,
        imageUrl: item.image_url || item.imageUrl,
        title: item.title,
        duration: item.duration,
        error: item.error,
      });
    }
  }

  return results;
}

function normalizeStatus(status: string): SunoTaskResult['status'] {
  const s = (status || '').toLowerCase();
  if (s === 'completed' || s === 'complete' || s === 'done') return 'completed';
  if (s === 'failed' || s === 'error') return 'failed';
  if (s === 'processing' || s === 'running' || s === 'streaming' || s === 'queued') return 'processing';
  return 'submitted';
}
