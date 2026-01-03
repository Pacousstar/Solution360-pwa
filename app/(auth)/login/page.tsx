'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

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

      console.log('🔐 Login attempt:', email)

      // ÉTAPE 1 : Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('❌ Auth error:', authError)
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Utilisateur introuvable')
        setLoading(false)
        return
      }

      console.log('✅ Auth OK, user_id:', authData.user.id)

      // ÉTAPE 2 : Vérifier admin avec fetch direct (bypass 406)
      let isAdmin = false
      
      try {
        // Essayer avec .from() standard
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('is_admin')
          .eq('user_id', authData.user.id)
          .maybeSingle()

        console.log('Admin check:', { adminData, adminError })

        if (adminError) {
          console.warn('⚠️ Erreur admin_users, essai avec fetch direct...')
          
          // FALLBACK : Requête fetch directe
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${authData.user.id}&select=is_admin`,
            {
              headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.ok) {
            const directData = await response.json()
            console.log('✅ Fetch direct OK:', directData)
            isAdmin = directData[0]?.is_admin === true
          } else {
            console.error('❌ Fetch direct failed:', response.status, await response.text())
            throw new Error('Table admin_users inaccessible')
          }
        } else {
          isAdmin = adminData?.is_admin === true
        }
      } catch (err) {
        console.warn('⚠️ Toutes méthodes échouées, fallback email...')
        // FALLBACK FINAL : Liste hardcodée
        const adminEmails = [
          'pacous2000@gmail.com',
          'admin@solution360.app',
        ]
        isAdmin = adminEmails.includes(authData.user.email || '')
      }

      console.log('🎯 Final isAdmin:', isAdmin)

      // ÉTAPE 3 : Redirection
      if (isAdmin) {
        console.log('✅ Redirect → /admin/demandes')
        router.push('/admin/demandes')
      } else {
        console.log('✅ Redirect → /demandes')
        router.push('/demandes')
      }
      
      router.refresh()
    } catch (err: any) {
      console.error('💥 Error:', err)
      setError('Erreur de connexion')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-green-50 to-teal-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="mx-auto w-28 h-28 bg-gradient-to-br from-orange-500 to-green-600 rounded-3xl flex items-center justify-center shadow-2xl mb-5 transform hover:scale-110 transition-transform duration-300">
            <span className="text-3xl font-bold text-white">360°</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-orange-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            Solution360°
          </h1>
          <p className="text-lg text-gray-600 font-semibold">GSN Expertises Group</p>
        </div>

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

        <p className="text-center text-xs text-gray-600 mt-4">
          © 2026 Solution360° - Tous droits réservés
        </p>
      </div>
    </div>
  )
}
