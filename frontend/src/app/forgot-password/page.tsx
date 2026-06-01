"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [developmentToken, setDevelopmentToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setDevelopmentToken("");
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      setMessage("Si el correo existe, se generó una liga de recuperación.");

      if (result.developmentResetToken) {
        setDevelopmentToken(result.developmentResetToken);
      }
    } catch {
      setError("No se pudo generar la recuperación. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">Complienx</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Recuperar contraseña</h1>
          <p className="mt-2 text-sm text-slate-500">
            Escribe tu correo para generar una liga de recuperación.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p> : null}

          {developmentToken ? (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Token temporal de desarrollo</p>
              <p className="mt-2 break-all font-mono text-xs">{developmentToken}</p>
              <Link
                className="mt-3 inline-block font-medium text-amber-900 underline"
                href={`/reset-password?token=${developmentToken}`}
              >
                Abrir pantalla de cambio de contraseña
              </Link>
            </div>
          ) : null}

          <button
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={loading}
            type="submit"
          >
            {loading ? "Generando..." : "Generar recuperación"}
          </button>

          <Link className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700" href="/">
            Volver al login
          </Link>
        </form>
      </section>
    </main>
  );
}
