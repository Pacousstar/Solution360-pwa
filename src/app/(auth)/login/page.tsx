'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Créer client avec headers explicites
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
        }
      )

      logger.log('🔐 Login attempt:', email)

      // ÉTAPE 1 : Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        logger.error('❌ Auth error:', authError)
        setError(authError.message || 'Erreur de connexion. Vérifiez vos identifiants.')
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Utilisateur introuvable')
        setLoading(false)
        return
      }

      logger.log('✅ Auth OK, user_id:', authData.user.id)

      // ÉTAPE 2 : Vérifier admin via route API (sécurisé côté serveur)
      const checkAdminResponse = await fetch('/api/auth/check-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!checkAdminResponse.ok) {
        logger.warn('⚠️ Impossible de vérifier le statut admin, redirection par défaut')
        router.push('/demandes')
        router.refresh()
        return
      }

      const { isAdmin: adminStatus } = await checkAdminResponse.json()
      logger.log('🎯 Admin status:', adminStatus)

      // ÉTAPE 3 : Redirection
      if (adminStatus) {
        logger.log('✅ Redirect → /admin/demandes')
        router.push('/admin/demandes')
      } else {
        logger.log('✅ Redirect → /demandes')
        router.push('/demandes')
      }
      
      router.refresh()
    } catch (err: any) {
      logger.error('💥 Error:', err)
      setError(err?.message || 'Erreur de connexion. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-green-50 to-teal-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo + Titre */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <Logo size="xl" href="/" showText={false} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-orange-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            Solution360°
          </h1>
          <p className="text-lg text-gray-600 font-semibold">GSN Expertises Group</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-gray-800 font-bold mb-2 text-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Utilisateur
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre-email@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-gray-800 bg-white"
                disabled={loading}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-gray-800 font-bold mb-2 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all text-gray-800 bg-white"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl">
                <p className="text-red-700 font-semibold text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 via-green-500 to-teal-500 text-white py-4 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* ✅ NOUVEAU : Lien inscription */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{" "}
              <Link
                href="/register"
                className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                Créer un compte gratuitement
              </Link>
            </p>
          </div>

          {/* Comptes de test */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
            <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Comptes de test
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setEmail('pacousstar01@gmail.com'); setPassword('client') }}
                className="w-full flex items-center gap-2 p-2 bg-white rounded-lg hover:shadow-md transition-all text-left text-xs"
              >
                <span className="text-lg">👤</span>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">Client</div>
                  <code className="text-gray-600 text-[10px]">pacousstar01@gmail.com</code>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('pacous2000@gmail.com'); setPassword('admin') }}
                className="w-full flex items-center gap-2 p-2 bg-white rounded-lg hover:shadow-md transition-all text-left text-xs"
              >
                <span className="text-lg">👨‍💼</span>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">Admin</div>
                  <code className="text-gray-600 text-[10px]">pacous2000@gmail.com</code>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ✅ NOUVEAU : Lien retour accueil */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          © 2026 Solution360° - Tous droits réservés
        </p>
      </div>
    </div>
  )
}
