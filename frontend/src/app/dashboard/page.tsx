"use client";

import { FileText, ListChecks, ShieldCheck, TrendingUp } from "lucide-react";

const metrics = [
  { label: "Documentos activos", value: "1", icon: FileText, helper: "Control documental" },
  { label: "Aprobaciones", value: "0", icon: ShieldCheck, helper: "Pendientes" },
  { label: "Acciones", value: "0", icon: ListChecks, helper: "Abiertas" },
  { label: "Cumplimiento", value: "85%", icon: TrendingUp, helper: "Estimado" }
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-slate-950 p-6 text-white lg:block">
        <div>
          <h1 className="text-lg font-semibold">Complienx</h1>
          <p className="mt-1 text-xs text-slate-400">Sistema de cumplimiento</p>
        </div>

        <nav className="mt-10 space-y-2 text-sm">
          {[
            "Dashboard",
            "Documentos",
            "Aprobaciones",
            "Acciones",
            "Tareas",
            "Usuarios",
            "Configuración"
          ].map((item) => (
            <a
              className={`block rounded-xl px-4 py-3 ${item === "Dashboard" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-900"}`}
              href="#"
              key={item}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <section className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white px-8 py-5">
          <h2 className="text-xl font-semibold text-slate-950">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Vista general del sistema de cumplimiento.</p>
        </header>

        <div className="space-y-6 p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200" key={metric.label}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{metric.label}</p>
                    <span className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Icon size={20} />
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{metric.value}</p>
                  <p className="mt-1 text-sm text-emerald-600">{metric.helper}</p>
                </article>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-base font-semibold text-slate-950">Actividad reciente</h3>
              <p className="mt-1 text-sm text-slate-500">Últimos movimientos registrados.</p>

              <div className="mt-6 space-y-4">
                {[
                  "Manual de Calidad creado",
                  "Categoría Procedimientos agregada",
                  "Usuario Administrador inició sesión"
                ].map((item) => (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4" key={item}>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item}</p>
                      <p className="text-xs text-slate-500">Hace unos minutos</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-base font-semibold text-slate-950">Tareas pendientes</h3>
              <p className="mt-1 text-sm text-slate-500">Elementos que requieren atención.</p>

              <div className="mt-6 space-y-3">
                {[
                  "Subir versión del Manual de Calidad",
                  "Enviar documento a aprobación",
                  "Crear primera acción correctiva"
                ].map((item) => (
                  <div className="rounded-xl bg-slate-50 p-4" key={item}>
                    <p className="text-sm font-medium text-slate-800">{item}</p>
                    <p className="mt-1 text-xs text-slate-500">Prioridad media</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
