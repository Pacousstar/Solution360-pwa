"use client";

import { useState, useTransition } from "react";
import { login, signup } from "../actions";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    formData.set("email", email);
    formData.set("password", password);

    const action = mode === "login" ? login : signup;
    const res = await action(formData);

    if (res && !res.ok) {
      setIsError(true);
      setMessage(res.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-sky-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white/90 p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Solution360°</h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === "login"
              ? "Connectez-vous à votre compte"
              : "Créez votre compte"}
          </p>
        </div>

        {message && (
          <div
            className={[
              "rounded-md px-3 py-2 text-sm border",
              isError
                ? "bg-red-50 text-red-800 border-red-100"
                : "bg-emerald-50 text-emerald-800 border-emerald-100",
            ].join(" ")}
          >
            {message}
          </div>
        )}

        <form
          className="space-y-4"
          action={(formData) => {
            startTransition(() => handleSubmit(formData));
          }}
        >
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-wide text-gray-600"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-medium uppercase tracking-wide text-gray-600"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isPending
              ? "Chargement..."
              : mode === "login"
              ? "Se connecter"
              : "Créer un compte"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          {mode === "login" ? (
            <p>
              Pas encore de compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setMessage(null);
                }}
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Créer un compte
              </button>
            </p>
          ) : (
            <p>
              Déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage(null);
                }}
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Se connecter
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
