"use client";

import Link from "next/link";
import { useState } from "react";
import { signup } from "@/lib/api";
import { saveAuthSession } from "@/lib/auth-storage";

export default function SignupPage() {
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signup({
        companyName,
        legalName: legalName || undefined,
        taxId: taxId || undefined,
        name,
        email,
        password
      });

      saveAuthSession(result);
      window.location.href = "/dashboard";
    } catch {
      setError("No se pudo crear la cuenta. Revisa los datos capturados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">Complienx</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Crear cuenta</h1>
          <p className="mt-2 text-sm text-slate-500">
            Registra tu empresa y crea el primer usuario administrador.
          </p>
        </div>

        <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="companyName">
              Nombre de la empresa
            </label>
            <input
              id="companyName"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="legalName">
              Razón social
            </label>
            <input
              id="legalName"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={legalName}
              onChange={(event) => setLegalName(event.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="taxId">
              RFC o identificador fiscal
            </label>
            <input
              id="taxId"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={taxId}
              onChange={(event) => setTaxId(event.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700" htmlFor="name">
              Nombre del administrador
            </label>
            <input
              id="name"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

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

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
            <p className="mt-2 text-xs text-slate-500">Mínimo 8 caracteres.</p>
          </div>

          {error ? <p className="md:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link className="text-sm font-medium text-blue-600 hover:text-blue-700" href="/">
              Ya tengo cuenta
            </Link>
            <button
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={loading}
              type="submit"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
