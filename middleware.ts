import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import appConfig from './lib/app-config';
import logger from './lib/logger';

// Replaces both buildFinalURL and withAuthHeaders
const rewriteTo = (relativePath: string, base: string | URL): NextResponse => {
  const baseUrl = new URL(base);
  const finalUrl = new URL(relativePath, baseUrl);
  finalUrl.search = baseUrl.search; // preserve search params
  return NextResponse.rewrite(finalUrl);
};

// * MIDDLEWARE
export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;

  // Main domain (e.g. your-domain.com)
  const mainDomain = appConfig.mainDomain;

  // Wildcard version of the domain (e.g. .your-domain.com)
  const wildcardDomain = `.${mainDomain}`;

  // Get the requested hostname (e.g. demo.your-domain.com)
  const hostname = req.headers.get('host') || mainDomain;

  // Get the path of the request (e.g. /, /about, /dashboard)
  const path = url.pathname;

  // Extract the subdomain (e.g. 'demo' from demo.your-domain.com)
  const currentHost = hostname.replace(wildcardDomain, '');

  // Block access to internal system folders like /sub_domains
  const isPreventedPaths = ['/sub_domains'].some((pagePath) =>
    path.startsWith(pagePath)
  );

  // Determine if the request is for the main domain (not a subdomain)
  const isMainDomain = hostname === mainDomain;

  // Identify if the request is for the main app (app., www., or main domain itself)
  const isApp =
    currentHost === 'app' ||
    currentHost?.toLowerCase() === 'www' ||
    (isMainDomain && !isPreventedPaths);

  // Define routing logic based on domain and path
  const routings = {
    /** ROUTING_01: Requests for app., www., or main domain go to `/root-app` */
    ROUTING_01: isApp,

    /** ROUTING_02: Blocked system paths are redirected to `/root-app/404` */
    ROUTING_02: isPreventedPaths,

    /** ROUTING_03: All subdomain routes (except `/404`) are authenticated and rewritten */
    ROUTING_03: !path.startsWith(`/404`),
  };

  if (routings.ROUTING_01) {
    return rewriteTo(`/root-app${path}`, req.url);
  }

  if (routings.ROUTING_02) {
    return rewriteTo('/root-app/404', url.origin);
  }

  if (routings.ROUTING_03) {
    // Protect all subdomain routes except auth-related routes
    // if (!isAuthRoute(req)) await auth.protect();

    return rewriteTo(`/sub_domains/${currentHost}${path}`, req.url);
  }

  logger.info('___Fallback routing -');
});

// * MIDDLEWARE CONFIG
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|favicon.ico|sitemap.xml|robots.txt|\\.well-known|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
