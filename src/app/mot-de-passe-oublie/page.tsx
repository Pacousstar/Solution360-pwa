'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Logo from '@/components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue')
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
            Mot de passe oublié
          </h1>
          <p className="text-gray-600">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border-2 border-green-400 text-green-800 px-4 py-3 rounded-lg text-sm font-medium">
                ✅ Email envoyé ! Vérifiez votre boîte de réception.
              </div>
              <Link
                href="/login"
                className="inline-block text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-sky-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-orange-600 transition"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

