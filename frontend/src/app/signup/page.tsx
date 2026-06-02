"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { signup } from "@/lib/api";
import { saveAuthSession } from "@/lib/auth-storage";

export default function SignupPage() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(
    () => [
      { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
      { label: "Incluye número o símbolo", valid: /[0-9\W_]/.test(password) },
      { label: "Incluye mayúscula y minúscula", valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
      { label: "Las contraseñas coinciden", valid: password.length > 0 && password === confirmPassword }
    ],
    [password, confirmPassword]
  );

  const isPasswordReady = passwordChecks.every((check) => check.valid);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!isPasswordReady) {
      setError("La contraseña todavía no cumple con todos los requisitos.");
      return;
    }

    setLoading(true);

    try {
      const result = await signup({
        companyName,
        name: email.split("@")[0] || "Administrador",
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
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-cyan-400/20 bg-slate-900/90 p-6 shadow-2xl shadow-cyan-950/40 md:p-10">
          <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-cyan-400 text-xl font-bold text-cyan-300">
                  C
                </div>
                <p className="text-3xl font-semibold tracking-tight text-cyan-300">Complienx</p>
              </div>
              <p className="mt-5 text-sm text-slate-300">
                ¿Ya tienes cuenta?{" "}
                <Link className="font-medium text-cyan-300 hover:text-cyan-200" href="/">
                  Inicia sesión
                </Link>
              </p>
            </div>

            <div className="rounded-full border border-cyan-400/30 px-4 py-2 text-sm font-medium text-cyan-200">
              7 días de prueba gratis
            </div>
          </header>

          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-cyan-100" htmlFor="companyName">
                  Nombre de empresa *
                </label>
                <input
                  id="companyName"
                  className="mt-2 w-full rounded-xl border border-cyan-400/60 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/10"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="ACME Inc."
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-cyan-100" htmlFor="email">
                  Correo de trabajo *
                </label>
                <input
                  id="email"
                  className="mt-2 w-full rounded-xl border border-cyan-400/60 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/10"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="correo@empresa.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-cyan-100" htmlFor="password">
                  Contraseña *
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    className="w-full rounded-xl border border-cyan-400/60 bg-slate-950/50 px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/10"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    className="absolute inset-y-0 right-3 text-slate-400 hover:text-cyan-200"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-cyan-100" htmlFor="confirmPassword">
                  Confirmar contraseña *
                </label>
                <div className="relative mt-2">
                  <input
                    id="confirmPassword"
                    className="w-full rounded-xl border border-cyan-400/60 bg-slate-950/50 px-4 py-3 pr-12 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-400/10"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    className="absolute inset-y-0 right-3 text-slate-400 hover:text-cyan-200"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    type="button"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error ? <p className="rounded-xl bg-red-950/60 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/30">{error}</p> : null}

              <button
                className="w-full rounded-xl bg-cyan-400 px-5 py-4 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                disabled={loading}
                type="submit"
              >
                {loading ? "Creando cuenta..." : "Iniciar prueba gratis"}
              </button>
            </form>

            <aside className="rounded-2xl border border-cyan-400/40 bg-slate-950/40 p-6">
              <p className="text-sm font-semibold text-cyan-100">Tu contraseña debe cumplir con:</p>
              <div className="mt-5 space-y-4">
                {passwordChecks.map((check) => (
                  <div className="flex items-center gap-3 text-sm" key={check.label}>
                    {check.valid ? (
                      <CheckCircle2 className="text-cyan-300" size={20} />
                    ) : (
                      <Circle className="text-slate-500" size={20} />
                    )}
                    <span className={check.valid ? "text-cyan-100" : "text-slate-400"}>{check.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl bg-cyan-400/10 p-4 text-sm leading-6 text-slate-300">
                Al crear tu cuenta se generará tu empresa y un usuario administrador para empezar a configurar documentos, tareas y acciones de cumplimiento.
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
