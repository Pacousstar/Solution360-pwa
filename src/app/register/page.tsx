import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegisterForm from "./RegisterForm";

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
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-sky-500 shadow-2xl mx-auto mb-4">
            <span className="text-2xl font-black text-white">S360</span>
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
