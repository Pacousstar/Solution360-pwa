// /middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { logger } from '@/lib/logger';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Rafraîchir la session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protéger les routes admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Vérifier que l'utilisateur est admin
    try {
      const { isAdmin } = await import('@/lib/admin/permissions');
      const adminStatus = await isAdmin(user.id, user.email || undefined);
      
      if (!adminStatus) {
        // Rediriger vers le dashboard client si non admin
        return NextResponse.redirect(new URL('/demandes', request.url));
      }
    } catch (error) {
      // En cas d'erreur, rediriger vers login pour sécurité
      logger.error('Erreur vérification admin dans middleware:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
