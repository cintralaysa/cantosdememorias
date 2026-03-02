import { NextRequest, NextResponse } from 'next/server';

// GET /api/test/suno-check?taskId=XXX — Debug endpoint to check raw Suno response
// Also accepts ?orderId=XXX to check from order's stored taskId
export async function GET(request: NextRequest) {
  const taskId = request.nextUrl.searchParams.get('taskId');
  const orderId = request.nextUrl.searchParams.get('orderId');

  const results: any = { timestamp: new Date().toISOString() };

  // If orderId provided, get stored taskId from order
  if (orderId && !taskId) {
    try {
      const { getOrder } = await import('@/lib/orderStore');
      const order = await getOrder(orderId);
      if (!order) {
        return NextResponse.json({ error: 'Order not found', orderId });
      }
      results.orderFound = true;
      results.musicStatus = order.musicStatus;
      results.musicRetryCount = order.musicRetryCount;

      const sunoTasks = typeof order.sunoTasks === 'string'
        ? JSON.parse(order.sunoTasks) : (order.sunoTasks || []);
      results.sunoTasks = sunoTasks;

      const songs = order.songs
        ? (typeof order.songs === 'string' ? JSON.parse(order.songs) : order.songs)
        : [];
      results.songs = songs;

      if (sunoTasks.length > 0) {
        // Check each task
        for (const task of sunoTasks) {
          const rawResult = await checkRawSunoStatus(task.taskId);
          results[`raw_${task.taskId}`] = rawResult;

          // Also run through our checkTaskStatus
          try {
            const { checkTaskStatus } = await import('@/lib/sunoClient');
            const parsed = await checkTaskStatus(task.taskId);
            results[`parsed_${task.taskId}`] = parsed;
          } catch (e: any) {
            results[`parsed_${task.taskId}_error`] = e.message;
          }
        }
      }

      return NextResponse.json(results);
    } catch (e: any) {
      return NextResponse.json({ error: e.message, stack: e.stack?.substring(0, 500) });
    }
  }

  if (!taskId) {
    return NextResponse.json({
      error: 'Provide ?taskId=XXX or ?orderId=XXX',
      usage: '/api/test/suno-check?taskId=bd48030b472b925f18608a08c06fe682',
    });
  }

  // Check raw Suno API response
  const rawResult = await checkRawSunoStatus(taskId);
  results.raw = rawResult;

  // Also check through our client
  try {
    const { checkTaskStatus } = await import('@/lib/sunoClient');
    const parsed = await checkTaskStatus(taskId);
    results.parsed = parsed;
  } catch (e: any) {
    results.parsed_error = e.message;
  }

  return NextResponse.json(results);
}

// Raw fetch to Suno API (bypasses our client to see exactly what comes back)
async function checkRawSunoStatus(taskId: string) {
  const SUNO_API_BASE = (process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org').trim();
  const SUNO_API_KEY = (process.env.SUNO_API_KEY || '').trim();

  try {
    const url = `${SUNO_API_BASE}/api/v1/generate/record-info?taskId=${taskId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
      },
      cache: 'no-store',
    });

    const status = response.status;
    const text = await response.text();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    return {
      httpStatus: status,
      rawText: text.substring(0, 2000),
      parsed,
      // Extract key fields for analysis
      dataExists: !!parsed?.data,
      recordStatus: parsed?.data?.status,
      recordStatusUpperCase: (parsed?.data?.status || '').toUpperCase(),
      hasSunoData: !!parsed?.data?.response?.sunoData,
      sunoDataLength: parsed?.data?.response?.sunoData?.length,
      hasResponseData: !!parsed?.data?.response?.data,
      responseDataLength: parsed?.data?.response?.data?.length,
      // Check for audio URLs in various locations
      audioUrlsInSunoData: (parsed?.data?.response?.sunoData || [])
        .map((item: any) => ({ id: item?.id, audioUrl: item?.audio_url, title: item?.title })),
      audioUrlsInData: (parsed?.data?.response?.data || [])
        .map((item: any) => ({ id: item?.id, audioUrl: item?.audio_url, title: item?.title })),
    };
  } catch (e: any) {
    return { error: e.message };
  }
}
