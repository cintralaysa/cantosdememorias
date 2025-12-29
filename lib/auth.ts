// Autenticação simples para o painel administrativo

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cantos2024';
const SESSION_TOKEN = 'cantos_admin_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'cantos-de-memorias-secret-key-2024';

// Gera um hash simples para a sessão
function generateSessionHash(password: string): string {
  const data = `${password}:${SESSION_SECRET}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + Date.now().toString(36);
}

// Verifica se a senha está correta
export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

// Cria uma sessão
export function createSession(): string {
  return generateSessionHash(ADMIN_PASSWORD);
}

// Verifica se há uma sessão válida (para uso em Server Components)
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_TOKEN);
    return !!session?.value;
  } catch {
    return false;
  }
}

// Verifica autenticação em API routes
export function isAuthenticatedRequest(request: NextRequest): boolean {
  const session = request.cookies.get(SESSION_TOKEN);
  return !!session?.value;
}

export { SESSION_TOKEN };
