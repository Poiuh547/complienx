"use client";

import { FileText, ListChecks, ShieldCheck, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const metrics = [
  { label: "Documentos activos", value: "1", icon: FileText, helper: "Control documental" },
  { label: "Aprobaciones", value: "0", icon: ShieldCheck, helper: "Pendientes" },
  { label: "Acciones", value: "0", icon: ListChecks, helper: "Abiertas" },
  { label: "Cumplimiento", value: "85%", icon: TrendingUp, helper: "Estimado" }
];

export default function DashboardPage() {
  return (
    <AppShell activeItem="Dashboard" description="Vista general de Complienx." title="Dashboard">
      <div className="space-y-6">
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
              {["Manual de Calidad creado", "Categoría Procedimientos agregada", "Usuario Administrador inició sesión"].map((item) => (
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
              {["Subir versión del Manual de Calidad", "Enviar documento a aprobación", "Crear primera acción correctiva"].map((item) => (
                <div className="rounded-xl bg-slate-50 p-4" key={item}>
                  <p className="text-sm font-medium text-slate-800">{item}</p>
                  <p className="mt-1 text-xs text-slate-500">Prioridad media</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
