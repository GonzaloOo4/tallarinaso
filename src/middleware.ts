import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/constants';

// Chequeo optimista: sin cookie de sesión no se entra a /admin.
// La validación real (token en la tabla sesiones) la hace requireAdmin en el servidor.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login' || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.search = '';
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ['/admin/:path*'] };
