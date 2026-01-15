import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegisterForm from "./RegisterForm";
import Logo from "@/components/Logo";
import LogoText from "@/components/LogoText";
import Link from "next/link";

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
          <div className="mb-2">
            <LogoText size="lg" />
          </div>
          <p className="text-gray-600">
            Rejoignez Solution360° et démarrez votre premier projet
          </p>
        </div>

        <RegisterForm />

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 Solution360° - Tous droits réservés |{" "}
          <Link href="/termes" className="hover:text-orange-600 transition">
            Termes et conditions
          </Link>
        </p>
      </div>
    </div>
  );
}
