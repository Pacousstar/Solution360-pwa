"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const acceptTerms = formData.get("acceptTerms") === "on";

    // Validation simple
    if (!email || !password || !fullName) {
      setError("Tous les champs sont obligatoires");
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      setError("Vous devez accepter les termes et conditions");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      // Inscription
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Si l'email nécessite une confirmation
      if (data.user && !data.session) {
        setMessage(
          "✅ Compte créé ! Vérifiez votre email pour confirmer votre inscription."
        );
        setLoading(false);
        return;
      }

      // Si connexion automatique (email confirmation désactivée)
      if (data.session) {
        setMessage("✅ Compte créé avec succès ! Redirection...");
        setTimeout(() => {
          router.push("/demandes");
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message de succès */}
        {message && (
          <div className="bg-green-50 border-2 border-green-400 text-green-800 px-4 py-3 rounded-lg text-sm font-medium">
            {message}
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 border-2 border-red-400 text-red-800 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* Nom complet */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Nom complet
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="Jean Dupont"
          />
        </div>

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
            name="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="vous@exemple.com"
          />
        </div>

        {/* Mot de passe avec œil */}
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 6 caractères"
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

        {/* Termes et conditions */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="acceptTerms"
            name="acceptTerms"
            required
            className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700">
            J'accepte les{" "}
            <Link href="/termes" className="text-orange-600 hover:text-orange-700 font-semibold">
              termes et conditions
            </Link>
          </label>
        </div>

        {/* Bouton submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-sky-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {loading ? "Création en cours..." : "Créer mon compte"}
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

      {/* Lien connexion */}
      <p className="text-center text-sm text-gray-600">
        Vous avez déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-semibold text-orange-600 hover:text-orange-700"
        >
          Se connecter
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
  );
}
