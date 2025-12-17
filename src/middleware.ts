import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the raw URL path from the request URL string
  // request.nextUrl.pathname may already be normalized, so check the raw URL
  const url = request.url;
  const origin = request.nextUrl.origin;

  // Extract the path portion after the origin
  const pathWithQuery = url.slice(origin.length);

  // Check for multiple consecutive slashes at the start of the path
  if (pathWithQuery.startsWith('//')) {
    // Normalize by removing extra leading slashes
    const normalizedPath = pathWithQuery.replace(/^\/+/, '/');

    // Redirect to the normalized URL
    return NextResponse.redirect(new URL(normalizedPath, origin), 308);
  }

  // Also check for double slashes anywhere in the pathname
  const { pathname } = request.nextUrl;
  if (pathname.includes('//')) {
    const normalizedPathname = pathname.replace(/\/+/g, '/');
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = normalizedPathname;
    return NextResponse.redirect(newUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Match all request paths
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
