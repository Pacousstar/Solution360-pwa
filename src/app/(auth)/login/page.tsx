'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import Logo from '@/components/Logo'
import PasswordInput from '@/components/PasswordInput'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      logger.log('🔐 Login attempt:', email)

      // ÉTAPE 1 : Auth avec options de persistance
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

      // ÉTAPE 3 : Attendre un peu pour que la session soit bien enregistrée
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // ÉTAPE 4 : Redirection avec window.location pour forcer le rechargement complet
      if (adminStatus) {
        logger.log('✅ Redirect → /admin/demandes')
        window.location.href = '/admin/demandes'
      } else {
        logger.log('✅ Redirect → /demandes')
        window.location.href = '/demandes'
      }
    } catch (err: any) {
      logger.error('💥 Error:', err)
      setError(err?.message || 'Erreur de connexion. Veuillez réessayer.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-sky-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" href="/" showText={false} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Se connecter
          </h1>
          <p className="text-gray-600">
            Accédez à votre espace Solution360°
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                autoComplete="email"
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
              />
            </div>

            {/* Mot de passe avec œil */}
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
              disabled={loading}
              id="password"
              name="password"
              label="Mot de passe"
              labelIcon={
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {/* Se souvenir de moi + Mot de passe oublié */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Se souvenir de moi</span>
              </label>
              <Link
                href="/mot-de-passe-oublie"
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-sky-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          {/* Lien inscription */}
          <p className="text-center text-sm text-gray-600">
            Vous n'avez pas de compte ?{" "}
            <Link
              href="/register"
              className="font-semibold text-orange-600 hover:text-orange-700"
            >
              Créer un compte
            </Link>
          </p>

          {/* Lien retour accueil */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à l'accueil
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 Solution360° - Tous droits réservés |{" "}
          <Link href="/termes" className="hover:text-orange-600 transition">
            Termes et conditions
          </Link>
        </p>
      </div>
    </div>
  )
}
