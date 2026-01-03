import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ✅ VÉRIFICATION ADMIN SIMPLIFIÉE
  const adminEmails = ['pacous2000@gmail.com', 'admin@solution360.app']
  const isAdmin = user && adminEmails.includes(user.email || '')

  // Routes protégées
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/demandes', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/demandes') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirection si déjà connecté
  if (request.nextUrl.pathname === '/login' && user) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/demandes', request.url))
    } else {
      return NextResponse.redirect(new URL('/demandes', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
