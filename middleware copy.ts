import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // Rafraîchir la session si nécessaire
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Routes protégées
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/demandes') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirection si déjà connecté
  if (request.nextUrl.pathname === '/login' && user) {
    // Vérifier si admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminData?.is_admin) {
      return NextResponse.redirect(new URL('/admin/demandes', request.url))
    } else {
      return NextResponse.redirect(new URL('/demandes', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
