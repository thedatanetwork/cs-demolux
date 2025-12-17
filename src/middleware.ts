import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for multiple consecutive slashes in the pathname
  if (pathname !== '/' && pathname.includes('//')) {
    // Normalize the pathname by replacing multiple slashes with a single slash
    const normalizedPathname = pathname.replace(/\/+/g, '/');

    // Create a new URL with the normalized pathname
    const url = request.nextUrl.clone();
    url.pathname = normalizedPathname;

    // Redirect to the normalized URL
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Match all paths except static files and API routes that shouldn't be processed
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
