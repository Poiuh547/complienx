"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, getStoredToken } from "@/lib/api";

type DashboardTask = {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  dueDate: string | null;
  relatedEntityType: "document" | "approval" | "action";
  relatedEntityId: string;
  href: string;
};

const severityLabels: Record<DashboardTask["severity"], string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica"
};

const severityClasses: Record<DashboardTask["severity"], string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-50 text-blue-700",
  high: "bg-amber-50 text-amber-700",
  critical: "bg-red-50 text-red-700"
};

const typeLabels: Record<string, string> = {
  document_approval: "Aprobación",
  overdue_action: "Acción vencida",
  open_action: "Acción abierta",
  overdue_document_review: "Documento vencido",
  upcoming_document_review: "Revisión documental"
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    const token = getStoredToken();

    if (!token) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<{ tasks: DashboardTask[] }>("/api/tasks/dashboard", token);
      setTasks(response.tasks);
    } catch {
      setError("No se pudieron cargar las tareas pendientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const criticalTasks = useMemo(() => tasks.filter((task) => task.severity === "critical").length, [tasks]);
  const highTasks = useMemo(() => tasks.filter((task) => task.severity === "high").length, [tasks]);

  return (
    <AppShell activeItem="Tareas" description="Bandeja automática de pendientes del sistema." title="Tareas">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total de pendientes</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{tasks.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Críticas</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{criticalTasks}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Alta prioridad</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{highTasks}</p>
          </article>
        </section>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Pendientes calculados</h3>
              <p className="mt-1 text-sm text-slate-500">
                Se generan automáticamente desde documentos, aprobaciones y acciones.
              </p>
            </div>

            <button
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={fetchTasks}
              type="button"
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>

          {error ? <p className="m-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          {loading ? (
            <div className="p-6 text-sm text-slate-500">Cargando tareas...</div>
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center">
              <h4 className="text-base font-semibold text-slate-950">No hay pendientes</h4>
              <p className="mt-2 text-sm text-slate-500">Por ahora no hay documentos, aprobaciones o acciones que requieran atención.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <a className="block p-6 hover:bg-slate-50" href={task.href} key={task.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {typeLabels[task.type] ?? task.type}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${severityClasses[task.severity]}`}>
                          {severityLabels[task.severity]}
                        </span>
                      </div>
                      <h4 className="mt-3 text-base font-semibold text-slate-950">{task.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">{task.description}</p>
                    </div>

                    <div className="text-sm text-slate-500 md:text-right">
                      <p>Fecha límite</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString("es-MX") : "No definida"}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
