import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createSession, SESSION_TOKEN } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    const session = createSession();

    const response = NextResponse.json({ success: true });

    response.cookies.set(SESSION_TOKEN, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}
