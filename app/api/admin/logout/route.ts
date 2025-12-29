import { NextResponse } from 'next/server';
import { SESSION_TOKEN } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(SESSION_TOKEN, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
