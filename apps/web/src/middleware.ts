import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { supabaseResponse, user, supabase } = await updateSession(request)

  // Rutas públicas: invitaciones de gym
  if (pathname.startsWith('/unirse')) {
    return supabaseResponse
  }

  // Rutas públicas de auth (sin sesión requerida)
  if (pathname === '/forgot-password' || pathname === '/reset-password') {
    return supabaseResponse
  }

  // Rutas de auth: si ya hay sesión, redirigir al panel correcto
  if (pathname === '/login' || pathname === '/callback') {
    if (user) {
      return NextResponse.redirect(new URL('/superadmin/gyms', request.url))
    }
    return supabaseResponse
  }

  // Todas las demás rutas requieren sesión
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rutas de superadmin: verificar rol superadmin
  if (pathname.startsWith('/superadmin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Rutas de dashboard: verificar rol admin o profe
  if (pathname.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, gym_id')
      .eq('id', user.id)
      .single()

    if (!profile?.gym_id || !['admin', 'profe'].includes(profile.role)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
