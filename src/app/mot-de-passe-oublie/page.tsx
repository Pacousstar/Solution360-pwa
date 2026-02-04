'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { Card, CardBody, CardHeader, CardTitle, Input, Button, Alert } from '@/components/ui'
import { Mail, ArrowLeft } from 'lucide-react'
import { logger } from '@/lib/logger'

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

    // Validation de l'email
    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      setLoading(false)
      return
    }

    try {
      // Vérifier que les variables d'environnement sont disponibles
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        logger.error('❌ Variables d\'environnement Supabase manquantes')
        setError('Erreur de configuration. Veuillez contacter le support.')
        setLoading(false)
        return
      }

      const supabase = createClient()
      
      // Vérifier que le client est bien créé
      if (!supabase) {
        logger.error('❌ Impossible de créer le client Supabase')
        setError('Erreur de connexion. Veuillez réessayer.')
        setLoading(false)
        return
      }

      // Utiliser process.env.NEXT_PUBLIC_URL ou window.location.origin de manière sécurisée
      const redirectUrl = typeof window !== 'undefined' && window.location
        ? `${window.location.origin}/auth/callback?type=recovery`
        : `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/auth/callback?type=recovery`

      logger.log('🔐 Envoi demande reset password pour:', email)
      logger.log('🔗 URL de redirection:', redirectUrl)
      logger.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

      // Appel à l'API Supabase avec timeout
      const resetPromise = supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      // Ajouter un timeout de 10 secondes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La requête a pris trop de temps')), 10000)
      })

      const { error: resetError } = await Promise.race([resetPromise, timeoutPromise]) as any

      if (resetError) {
        logger.error('❌ Erreur reset password:', resetError)
        
        // Messages d'erreur plus spécifiques
        let errorMessage = 'Erreur lors de l\'envoi de l\'email'
        if (resetError.message?.includes('network') || resetError.message?.includes('fetch')) {
          errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet.'
        } else if (resetError.message?.includes('email')) {
          errorMessage = resetError.message
        } else if (resetError.message) {
          errorMessage = resetError.message
        }
        
        setError(errorMessage)
        setLoading(false)
        return
      }

      logger.log('✅ Email de réinitialisation envoyé avec succès')
      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      logger.error('❌ Erreur catch reset password:', err)
      
      // Messages d'erreur plus spécifiques
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.'
      if (err?.message?.includes('Timeout')) {
        errorMessage = 'La requête a pris trop de temps. Vérifiez votre connexion internet.'
      } else if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
        errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet et réessayez.'
      } else if (err?.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
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
        <Card variant="elevated">
          <CardBody className="p-8">
            {success ? (
              <div className="text-center space-y-4">
                <Alert variant="success">
                  Email envoyé ! Vérifiez votre boîte de réception.
                </Alert>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="error">
                    {error}
                  </Alert>
                )}

                <Input
                  type="email"
                  id="email"
                  label="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  disabled={loading}
                  required
                  leftIcon={<Mail className="h-5 w-5" />}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  isLoading={loading}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  leftIcon={!loading ? <Mail className="w-5 h-5" /> : undefined}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link href="/login">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

