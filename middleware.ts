import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protection dashboard utilisateur
  if (!user && request.nextUrl.pathname.startsWith("/demandes")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user && request.nextUrl.pathname.startsWith("/nouvelle-demande")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protection admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Vérifier si admin
    const { data: adminCheck } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!adminCheck) {
      return NextResponse.redirect(new URL("/demandes", request.url));
    }
  }

  // Si connecté et tente d'accéder à /login → redirect demandes
  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/demandes", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/demandes/:path*",
    "/nouvelle-demande/:path*",
    "/admin/:path*",
    "/login",
  ],
};
