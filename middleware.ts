import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect /creditos to /descentralizacoes for backward compatibility
  if (request.nextUrl.pathname.startsWith('/creditos')) {
    const newPath = request.nextUrl.pathname.replace('/creditos', '/descentralizacoes');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return NextResponse.next();
}

// Configure which routes should use this middleware
export const config = {
  matcher: '/creditos/:path*',
};
