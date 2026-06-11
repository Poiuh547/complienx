"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, getStoredToken } from "@/lib/api";

type DashboardMetrics = {
  totalDocuments: number;
  activeDocuments: number;
  documentsInReview: number;
  approvedDocuments: number;
  pendingApprovals: number;
  openActions: number;
  overdueActions: number;
  totalTasks: number;
  criticalTasks: number;
  highTasks: number;
  complianceScore: number;
};

type DashboardSummary = {
  metrics: DashboardMetrics;
};

export default function IndicatorsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    const token = getStoredToken();

    if (!token) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<{ summary: DashboardSummary }>("/api/dashboard/summary", token);
      setSummary(response.summary);
    } catch {
      setError("No se pudo cargar la información de indicadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const metricCards = summary
    ? [
        {
          label: "Cumplimiento documental",
          value: `${summary.metrics.complianceScore}%`,
          helper: `${summary.metrics.approvedDocuments} de ${summary.metrics.totalDocuments} documentos aprobados`
        },
        {
          label: "Acciones abiertas",
          value: String(summary.metrics.openActions),
          helper: `${summary.metrics.overdueActions} vencidas`
        },
        {
          label: "Documentos en revisión",
          value: String(summary.metrics.documentsInReview),
          helper: `${summary.metrics.pendingApprovals} aprobaciones pendientes`
        },
        {
          label: "Tareas críticas",
          value: String(summary.metrics.criticalTasks),
          helper: `${summary.metrics.highTasks} de alta prioridad`
        }
      ]
    : [
        { label: "Cumplimiento documental", value: "...", helper: "Cargando" },
        { label: "Acciones abiertas", value: "...", helper: "Cargando" },
        { label: "Documentos en revisión", value: "...", helper: "Cargando" },
        { label: "Tareas críticas", value: "...", helper: "Cargando" }
      ];

  const statusData = summary
    ? [
        ["Aprobados", String(summary.metrics.approvedDocuments), `${summary.metrics.totalDocuments ? Math.round((summary.metrics.approvedDocuments / summary.metrics.totalDocuments) * 100) : 0}%`],
        ["En revisión", String(summary.metrics.documentsInReview), `${summary.metrics.totalDocuments ? Math.round((summary.metrics.documentsInReview / summary.metrics.totalDocuments) * 100) : 0}%`],
        ["Pendientes de aprobación", String(summary.metrics.pendingApprovals), `${summary.metrics.totalDocuments ? Math.round((summary.metrics.pendingApprovals / summary.metrics.totalDocuments) * 100) : 0}%`],
        ["Acciones abiertas", String(summary.metrics.openActions), `${summary.metrics.totalTasks ? Math.round((summary.metrics.openActions / summary.metrics.totalTasks) * 100) : 0}%`]
      ]
    : [
        ["Aprobados", "...", "..."],
        ["En revisión", "...", "..."],
        ["Pendientes de aprobación", "...", "..."],
        ["Acciones abiertas", "...", "..."]
      ];

  const keyStats = summary
    ? [
        { label: "Tareas totales", value: String(summary.metrics.totalTasks) },
        { label: "Alta prioridad", value: String(summary.metrics.highTasks) },
        { label: "Vencidas", value: String(summary.metrics.overdueActions) }
      ]
    : [
        { label: "Tareas totales", value: "..." },
        { label: "Alta prioridad", value: "..." },
        { label: "Vencidas", value: "..." }
      ];

  return (
    <AppShell title="Indicadores" description="Visión rápida de los indicadores clave del sistema." activeItem="Indicadores">
      <div className="space-y-8">
        {error ? <p className="rounded-3xl bg-red-50 px-6 py-4 text-sm text-red-700">{error}</p> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => (
            <article key={metric.label} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950">{metric.value}</p>
              <p className="mt-2 text-sm text-slate-500">{metric.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Estado general</h2>
                <p className="mt-1 text-sm text-slate-500">Resumen de la distribución de documentos y acciones.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">Actualizado recientemente</span>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <div className="grid gap-px bg-slate-200 text-left text-xs uppercase text-slate-500 sm:grid-cols-3">
                <div className="bg-white px-4 py-3">Estado</div>
                <div className="bg-white px-4 py-3">Cantidad</div>
                <div className="bg-white px-4 py-3">% del total</div>
              </div>
              {statusData.map(([label, count, percent]) => (
                <div key={label} className="grid gap-px bg-slate-200 sm:grid-cols-3">
                  <div className="bg-white px-4 py-4 text-sm text-slate-700">{label}</div>
                  <div className="bg-white px-4 py-4 text-sm text-slate-900">{count}</div>
                  <div className="bg-white px-4 py-4 text-sm text-slate-500">{percent}</div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-950">Datos clave</h2>
            <p className="mt-1 text-sm text-slate-500">Indicadores reales del sistema.</p>

            <div className="mt-6 space-y-4">
              {keyStats.map((item) => (
                <div key={item.label} className="rounded-3xl bg-slate-50 px-5 py-4">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
