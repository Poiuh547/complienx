"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, getStoredToken, type ComplianceAction } from "@/lib/api";

const typeLabels: Record<string, string> = {
  corrective: "Correctiva",
  preventive: "Preventiva",
  improvement: "Mejora"
};

const priorityLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica"
};

const statusLabels: Record<string, string> = {
  open: "Abierta",
  in_progress: "En proceso",
  in_review: "En revisión",
  closed: "Cerrada",
  cancelled: "Cancelada"
};

export default function ActionsPage() {
  const [actions, setActions] = useState<ComplianceAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ComplianceAction["type"]>("corrective");
  const [priority, setPriority] = useState<ComplianceAction["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");

  const fetchActions = async () => {
    const token = getStoredToken();

    if (!token) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<{ actions: ComplianceAction[] }>("/api/actions", token);
      setActions(response.actions);
    } catch {
      setError("No se pudieron cargar las acciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const openActions = useMemo(() => actions.filter((action) => action.status !== "closed" && action.status !== "cancelled").length, [actions]);
  const overdueActions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return actions.filter((action) => action.dueDate && new Date(action.dueDate) < today && action.status !== "closed" && action.status !== "cancelled").length;
  }, [actions]);

  const handleCreateAction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const token = getStoredToken();
    if (!token) {
      window.location.href = "/";
      return;
    }

    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    setSaving(true);

    try {
      await apiFetch("/api/actions", token, {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description || undefined,
          type,
          priority,
          dueDate: dueDate || undefined
        })
      });

      setTitle("");
      setDescription("");
      setType("corrective");
      setPriority("medium");
      setDueDate("");
      await fetchActions();
    } catch {
      setError("No se pudo crear la acción.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell activeItem="Acciones" description="Acciones correctivas, preventivas y de mejora." title="Acciones">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total de acciones</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{actions.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Abiertas</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{openActions}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Vencidas</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{overdueActions}</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <article className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Listado de acciones</h3>
                <p className="mt-1 text-sm text-slate-500">Seguimiento de acciones del sistema.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={fetchActions} type="button">
                <RefreshCw size={16} />
                Actualizar
              </button>
            </div>

            {error ? <p className="m-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

            {loading ? (
              <div className="p-6 text-sm text-slate-500">Cargando acciones...</div>
            ) : actions.length === 0 ? (
              <div className="p-12 text-center">
                <h4 className="text-base font-semibold text-slate-950">No hay acciones registradas</h4>
                <p className="mt-2 text-sm text-slate-500">Crea la primera acción para comenzar el seguimiento.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {actions.map((action) => (
                  <a className="block p-6 hover:bg-slate-50" href={`/actions/${action.id}`} key={action.id}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-slate-950">{action.title}</h4>
                        <p className="mt-1 text-sm text-slate-500">{action.description || "Sin descripción"}</p>
                        <p className="mt-3 text-xs text-slate-500">Responsable: {action.owner?.name ?? "Sin responsable"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{typeLabels[action.type]}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{priorityLabels[action.priority]}</span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{statusLabels[action.status]}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-base font-semibold text-slate-950">Nueva acción</h3>
            <p className="mt-1 text-sm text-slate-500">Registra una acción correctiva, preventiva o de mejora.</p>

            <form className="mt-6 space-y-4" onSubmit={handleCreateAction}>
              <div>
                <label className="text-sm font-medium text-slate-700">Título</label>
                <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Corregir procedimiento de recepción" value={title} />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Descripción</label>
                <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setDescription(event.target.value)} placeholder="Describe el hallazgo, causa o mejora esperada" value={description} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Tipo</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setType(event.target.value as ComplianceAction["type"])} value={type}>
                    <option value="corrective">Correctiva</option>
                    <option value="preventive">Preventiva</option>
                    <option value="improvement">Mejora</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Prioridad</label>
                  <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setPriority(event.target.value as ComplianceAction["priority"])} value={priority}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Fecha compromiso</label>
                <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setDueDate(event.target.value)} type="date" value={dueDate} />
              </div>

              <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={saving} type="submit">
                <Plus size={16} />
                {saving ? "Guardando..." : "Crear acción"}
              </button>
            </form>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
