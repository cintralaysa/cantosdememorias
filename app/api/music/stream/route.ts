import { NextRequest, NextResponse } from 'next/server';

// Proxy leve de áudio — redireciona para a URL do CDN com headers corretos
// Resolve problemas de CORS e Content-Disposition das URLs do Suno
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'url é obrigatório' }, { status: 400 });
  }

  // Validar que é uma URL do Suno (segurança — checagem estrita de hostname)
  try {
    const parsed = new URL(url);
    const allowedHosts = ['cdn1.suno.ai', 'cdn2.suno.ai', 'audiopipe.suno.ai', 'cdn.suno.ai'];
    const isAllowed = allowedHosts.some(h =>
      parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
    );
    if (!isAllowed) {
      return NextResponse.json({ error: 'URL não permitida' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
  }

  const isDownload = request.nextUrl.searchParams.get('dl') === '1';

  try {
    const audioResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CantosDeMemoriasBot/1.0)',
      },
    });

    if (!audioResponse.ok) {
      return NextResponse.json({ error: 'Erro ao buscar áudio' }, { status: 502 });
    }

    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
    const contentLength = audioResponse.headers.get('content-length');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    };

    if (isDownload) {
      headers['Content-Disposition'] = 'attachment; filename="musica.mp3"';
    }

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    return new NextResponse(audioResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[AUDIO-STREAM] Erro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
