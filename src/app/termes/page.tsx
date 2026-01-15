import Link from 'next/link'
import Logo from '@/components/Logo'

export default function TermesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sky-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" href="/" />
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Termes et Conditions
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptation des conditions</h2>
              <p className="text-gray-700 leading-relaxed">
                En accédant et en utilisant Solution360°, vous acceptez d'être lié par ces termes et conditions. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description du service</h2>
              <p className="text-gray-700 leading-relaxed">
                Solution360° est une plateforme de consulting digital qui permet aux clients de soumettre leurs projets/idées 
                et de recevoir des solutions professionnelles moyennant paiement. Notre service combine intelligence artificielle 
                et expertise humaine pour proposer des services digitaux personnalisés.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Utilisation du service</h2>
              <p className="text-gray-700 leading-relaxed">
                Vous vous engagez à utiliser Solution360° uniquement à des fins légales et conformément à ces termes. 
                Vous êtes responsable de maintenir la confidentialité de votre compte et de votre mot de passe.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Propriété intellectuelle</h2>
              <p className="text-gray-700 leading-relaxed">
                Tous les contenus, designs, logos et autres éléments de Solution360° sont la propriété de GSN EXPERTISES GROUP 
                et sont protégés par les lois sur la propriété intellectuelle.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Paiements</h2>
              <p className="text-gray-700 leading-relaxed">
                Les paiements sont effectués via les méthodes de paiement Mobile Money disponibles (Wave, Orange Money, MTN Mobile Money). 
                Tous les prix sont indiqués en FCFA. Les paiements sont non remboursables sauf accord contraire.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Confidentialité</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous nous engageons à protéger votre vie privée conformément à notre politique de confidentialité. 
                Vos données personnelles sont traitées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation de responsabilité</h2>
              <p className="text-gray-700 leading-relaxed">
                Solution360° est fourni "tel quel" sans garantie d'aucune sorte. Nous ne garantissons pas que le service 
                sera ininterrompu, sécurisé ou exempt d'erreurs.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications des termes</h2>
              <p className="text-gray-700 leading-relaxed">
                Nous nous réservons le droit de modifier ces termes à tout moment. Les modifications prendront effet 
                dès leur publication sur cette page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
              <p className="text-gray-700 leading-relaxed">
                Pour toute question concernant ces termes et conditions, veuillez nous contacter à :{' '}
                <a href="mailto:pacous2000@gmail.com" className="text-orange-600 hover:text-orange-700 font-semibold">
                  pacous2000@gmail.com
                </a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
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
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Logo size="lg" href="/" className="text-white" />
          </div>
          <p className="text-gray-400 mb-6">
            Plateforme de consulting digital alimentée par l'IA
          </p>
          <p className="text-sm text-gray-500">
            © 2026 GSN EXPERTISES GROUP. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}

