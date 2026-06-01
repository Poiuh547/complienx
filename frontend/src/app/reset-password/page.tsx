"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setStatus("Tu contraseña fue actualizada. Ya puedes iniciar sesión.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("No se pudo actualizar la contraseña. Revisa el token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">Complienx</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Cambiar contraseña</h1>
          <p className="mt-2 text-sm text-slate-500">Define una nueva contraseña para tu cuenta.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="token">Token</label>
            <textarea
              id="token"
              className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="password">Nueva contraseña</label>
            <input
              id="password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type="password"
              required
            />
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {status ? <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{status}</p> : null}

          <button
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            disabled={loading}
            type="submit"
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>

          <Link className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700" href="/">Volver al login</Link>
        </form>
      </section>
    </main>
  );
}
