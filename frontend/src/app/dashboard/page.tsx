"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileText, ListChecks, RefreshCw, ShieldCheck, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, getStoredToken } from "@/lib/api";

type DashboardSummary = {
  metrics: {
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
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    entityType: string;
    entityId: string;
    href: string;
    occurredAt: string;
  }>;
  urgentTasks: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    dueDate: string | null;
    href: string;
  }>;
};

const severityLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica"
};

const severityClasses: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  critical: "bg-red-50 text-red-700"
};

export default function DashboardPage() {
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
      setError("No se pudo cargar el resumen del dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const metrics = useMemo(() => {
    const values = summary?.metrics;

    return [
      {
        label: "Documentos activos",
        value: values ? String(values.activeDocuments) : "-",
        icon: FileText,
        helper: `${values?.documentsInReview ?? 0} en revisión`
      },
      {
        label: "Aprobaciones",
        value: values ? String(values.pendingApprovals) : "-",
        icon: ShieldCheck,
        helper: "Pendientes"
      },
      {
        label: "Acciones abiertas",
        value: values ? String(values.openActions) : "-",
        icon: ListChecks,
        helper: `${values?.overdueActions ?? 0} vencidas`
      },
      {
        label: "Cumplimiento",
        value: values ? `${values.complianceScore}%` : "-",
        icon: TrendingUp,
        helper: `${values?.approvedDocuments ?? 0} documentos aprobados`
      }
    ];
  }, [summary]);

  return (
    <AppShell activeItem="Dashboard" description="Vista general de Complienx con datos reales." title="Dashboard">
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={fetchSummary}
            type="button"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

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
                <p className="mt-4 text-3xl font-semibold text-slate-950">{loading ? "..." : metric.value}</p>
                <p className="mt-1 text-sm text-emerald-600">{metric.helper}</p>
              </article>
            );
          })}
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Tareas totales</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{loading ? "..." : summary?.metrics.totalTasks ?? 0}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Tareas críticas</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{loading ? "..." : summary?.metrics.criticalTasks ?? 0}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Alta prioridad</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{loading ? "..." : summary?.metrics.highTasks ?? 0}</p>
          </article>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-base font-semibold text-slate-950">Actividad reciente</h3>
            <p className="mt-1 text-sm text-slate-500">Últimos movimientos de documentos y acciones.</p>

            {loading ? (
              <p className="mt-6 text-sm text-slate-500">Cargando actividad...</p>
            ) : !summary?.recentActivity.length ? (
              <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No hay actividad reciente.</p>
            ) : (
              <div className="mt-6 space-y-4">
                {summary.recentActivity.map((item) => (
                  <a className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50" href={item.href} key={item.id}>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(item.occurredAt).toLocaleString("es-MX")}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Pendientes urgentes</h3>
                <p className="mt-1 text-sm text-slate-500">Elementos que requieren atención.</p>
              </div>
              <AlertTriangle className="text-amber-500" size={22} />
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-slate-500">Cargando pendientes...</p>
            ) : !summary?.urgentTasks.length ? (
              <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No hay pendientes urgentes.</p>
            ) : (
              <div className="mt-6 space-y-3">
                {summary.urgentTasks.map((task) => (
                  <a className="block rounded-xl bg-slate-50 p-4 hover:bg-slate-100" href={task.href} key={task.id}>
                    <div className="flex items-center justify-between gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${severityClasses[task.severity]}`}>
                        {severityLabels[task.severity]}
                      </span>
                      <span className="text-xs text-slate-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString("es-MX") : "Sin fecha"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-medium text-slate-800">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.description}</p>
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
