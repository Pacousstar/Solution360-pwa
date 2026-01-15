import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegisterForm from "./RegisterForm";
import Logo from "@/components/Logo";

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si déjà connecté, rediriger vers dashboard
  if (user) {
    redirect("/demandes");
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
            Créer un compte
          </h1>
          <p className="text-gray-600">
            Rejoignez Solution360° et démarrez votre premier projet
          </p>
        </div>

        <RegisterForm />

        {/* Lien connexion */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Vous avez déjà un compte ?{" "}
          <a
            href="/login"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
