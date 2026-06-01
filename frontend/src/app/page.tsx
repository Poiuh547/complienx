"use client";

import Link from "next/link";
import { useState } from "react";
import { login } from "@/lib/api";
import { saveAuthSession } from "@/lib/auth-storage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      saveAuthSession(result);
      window.location.href = "/dashboard";
    } catch {
      setError("No se pudo iniciar sesión. Revisa tus datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">Complienx</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-slate-500">
            Accede al sistema de cumplimiento, documentos y tareas.
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

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link className="font-medium text-blue-600 hover:text-blue-700" href="/forgot-password">
              Olvidé mi contraseña
            </Link>
            <Link className="font-medium text-blue-600 hover:text-blue-700" href="/signup">
              Crear cuenta
            </Link>
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <button
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={loading}
            type="submit"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
