import { NextRequest, NextResponse } from 'next/server';

// GET /api/test/diagnose — Testa cada componente do pipeline de música
export async function GET(request: NextRequest) {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Helper: check for trailing whitespace/newlines
  const checkEnv = (name: string) => {
    const val = process.env[name];
    if (!val) return 'MISSING';
    const trimmed = val.trim();
    if (val !== trimmed) return `SET (WARNING: has trailing whitespace! length ${val.length} vs ${trimmed.length})`;
    return 'SET';
  };

  // 1. Verificar variáveis de ambiente
  results.checks.envVars = {
    SUNO_API_KEY: checkEnv('SUNO_API_KEY'),
    SUNO_API_BASE_URL: checkEnv('SUNO_API_BASE_URL'),
    QSTASH_TOKEN: checkEnv('QSTASH_TOKEN'),
    UPSTASH_REDIS_REST_URL: checkEnv('UPSTASH_REDIS_REST_URL'),
    UPSTASH_REDIS_REST_TOKEN: checkEnv('UPSTASH_REDIS_REST_TOKEN'),
    NEXT_PUBLIC_BASE_URL: checkEnv('NEXT_PUBLIC_BASE_URL'),
    VERCEL_URL: process.env.VERCEL_URL || 'MISSING',
    INTERNAL_API_SECRET: checkEnv('INTERNAL_API_SECRET'),
    RESEND_API_KEY: checkEnv('RESEND_API_KEY'),
  };

  // 2. Testar Redis
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (redisUrl && redisToken) {
      const res = await fetch(`${redisUrl}/ping`, {
        headers: { 'Authorization': `Bearer ${redisToken}` },
      });
      const data = await res.json();
      results.checks.redis = { status: 'OK', response: data.result };
    } else {
      results.checks.redis = { status: 'SKIP', reason: 'Credenciais não configuradas' };
    }
  } catch (e: any) {
    results.checks.redis = { status: 'ERROR', error: e.message };
  }

  // 3. Testar Suno API (verificar créditos)
  try {
    const sunoBase = (process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org').trim();
    const sunoKey = (process.env.SUNO_API_KEY || '').trim();
    if (sunoKey) {
      const res = await fetch(`${sunoBase}/api/v1/generate/credit`, {
        headers: { 'Authorization': `Bearer ${sunoKey}` },
      });
      const data = await res.json();
      results.checks.sunoApi = {
        status: res.ok ? 'OK' : 'ERROR',
        httpStatus: res.status,
        credits: data.data,
        response: data,
      };
    } else {
      results.checks.sunoApi = { status: 'SKIP', reason: 'SUNO_API_KEY não configurada' };
    }
  } catch (e: any) {
    results.checks.sunoApi = { status: 'ERROR', error: e.message };
  }

  // 4. Testar QStash (listar schedules)
  try {
    const qstashToken = process.env.QSTASH_TOKEN;
    if (qstashToken) {
      const res = await fetch('https://qstash.upstash.io/v2/messages', {
        headers: { 'Authorization': `Bearer ${qstashToken}` },
      });
      results.checks.qstash = {
        status: res.ok ? 'OK' : 'ERROR',
        httpStatus: res.status,
      };
    } else {
      results.checks.qstash = { status: 'SKIP', reason: 'QSTASH_TOKEN não configurado' };
    }
  } catch (e: any) {
    results.checks.qstash = { status: 'ERROR', error: e.message };
  }

  // 5. Verificar URL base resolvida
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || '').trim();
  results.checks.baseUrl = {
    resolved: baseUrl ? (baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`) : 'https://cantosdememorias.com.br (fallback)',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'not set',
    VERCEL_URL: process.env.VERCEL_URL || 'not set',
  };

  // 6. Verificar orderId passado via query (opcional)
  const orderId = request.nextUrl.searchParams.get('orderId');
  if (orderId) {
    try {
      const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
      const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
      if (redisUrl && redisToken) {
        const res = await fetch(`${redisUrl}/get/order:${orderId}`, {
          headers: { 'Authorization': `Bearer ${redisToken}` },
        });
        const data = await res.json();
        if (data.result) {
          const order = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
          results.checks.order = {
            status: 'FOUND',
            musicStatus: order.musicStatus || 'not set',
            musicError: order.musicError || null,
            musicStartedAt: order.musicStartedAt || null,
            musicRetryCount: order.musicRetryCount || '0',
            creditsTotal: order.creditsTotal,
            creditsUsed: order.creditsUsed,
            accessCode: order.accessCode,
            hasSongs: !!order.songs,
            hasSunoTasks: !!order.sunoTasks,
            hasLyrics: !!(order.generatedLyrics || order.approvedLyrics),
          };
          // Parse songs for more detail
          if (order.songs) {
            const songs = typeof order.songs === 'string' ? JSON.parse(order.songs) : order.songs;
            results.checks.order.songs = songs.map((s: any) => ({
              id: s.id,
              status: s.status,
              sunoTaskId: s.sunoTaskId,
              audioUrl: s.audioUrl ? 'SET' : 'MISSING',
              error: s.error,
            }));
          }
          if (order.sunoTasks) {
            const tasks = typeof order.sunoTasks === 'string' ? JSON.parse(order.sunoTasks) : order.sunoTasks;
            results.checks.order.sunoTasks = tasks.map((t: any) => ({
              taskId: t.taskId,
              status: t.status,
              audioUrls: t.audioUrls?.length || 0,
              error: t.error,
            }));
          }
        } else {
          results.checks.order = { status: 'NOT_FOUND' };
        }
      }
    } catch (e: any) {
      results.checks.order = { status: 'ERROR', error: e.message };
    }
  }

  // Summary
  const allChecks = Object.values(results.checks);
  const hasErrors = Object.entries(results.checks).some(
    ([key, val]: [string, any]) => key !== 'envVars' && val.status === 'ERROR'
  );
  const missingEnvVars = Object.entries(results.checks.envVars)
    .filter(([, v]) => v === 'MISSING')
    .map(([k]) => k);

  results.summary = {
    healthy: !hasErrors && missingEnvVars.length === 0,
    missingEnvVars,
    hasErrors,
  };

  return NextResponse.json(results, { status: 200 });
}
