"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MessageSquare, RefreshCw, Save } from "lucide-react";
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

type PageProps = {
  params: {
    id: string;
  };
};

export default function ActionDetailPage({ params }: PageProps) {
  const [action, setAction] = useState<ComplianceAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [status, setStatus] = useState<ComplianceAction["status"]>("open");
  const [comment, setComment] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [closureResult, setClosureResult] = useState("");
  const [closureEvidence, setClosureEvidence] = useState("");
  const [verificationComment, setVerificationComment] = useState("");

  const fillForm = (item: ComplianceAction) => {
    setStatus(item.status);
    setRootCause(item.rootCause ?? "");
    setActionPlan(item.actionPlan ?? "");
    setClosureResult(item.closureResult ?? "");
    setClosureEvidence(item.closureEvidence ?? "");
    setVerificationComment(item.verificationComment ?? "");
  };

  const fetchAction = async () => {
    const token = getStoredToken();

    if (!token) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<{ action: ComplianceAction }>(`/api/actions/${params.id}`, token);
      setAction(response.action);
      fillForm(response.action);
    } catch {
      setError("No se pudo cargar la acción.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAction();
  }, [params.id]);

  const handleUpdateStatus = async () => {
    const token = getStoredToken();
    if (!token) return;

    setSavingStatus(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/api/actions/${params.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      await fetchAction();
      setSuccess("Estado actualizado correctamente.");
    } catch {
      setError("No se pudo actualizar el estado.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveAnalysis = async () => {
    const token = getStoredToken();
    if (!token) return;

    setSavingAnalysis(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/api/actions/${params.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({
          rootCause: rootCause || null,
          actionPlan: actionPlan || null,
          closureResult: closureResult || null,
          closureEvidence: closureEvidence || null,
          verificationComment: verificationComment || null
        })
      });
      await fetchAction();
      setSuccess("Información de análisis y cierre guardada correctamente.");
    } catch {
      setError("No se pudo guardar la información de la acción.");
    } finally {
      setSavingAnalysis(false);
    }
  };

  const handleCreateComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = getStoredToken();
    if (!token) return;

    if (!comment.trim()) {
      setError("El comentario no puede estar vacío.");
      return;
    }

    setSavingComment(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/api/actions/${params.id}/comments`, token, {
        method: "POST",
        body: JSON.stringify({ comment })
      });
      setComment("");
      await fetchAction();
      setSuccess("Comentario agregado correctamente.");
    } catch {
      setError("No se pudo agregar el comentario.");
    } finally {
      setSavingComment(false);
    }
  };

  return (
    <AppShell activeItem="Acciones" description="Seguimiento, análisis, cierre y comentarios de la acción." title="Detalle de acción">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <a className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600" href="/actions">
            <ArrowLeft size={16} />
            Volver a acciones
          </a>

          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={fetchAction} type="button">
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p> : null}

        {loading ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Cargando acción...</p>
          </section>
        ) : !action ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Acción no encontrada.</p>
          </section>
        ) : (
          <>
            <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Acción</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-950">{action.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{action.description || "Sin descripción"}</p>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <InfoCard label="Tipo" value={typeLabels[action.type]} />
                  <InfoCard label="Prioridad" value={priorityLabels[action.priority]} />
                  <InfoCard label="Estado actual" value={statusLabels[action.status]} />
                  <InfoCard label="Responsable" value={action.owner?.name ?? "Sin responsable"} />
                  <InfoCard label="Fecha compromiso" value={action.dueDate ? new Date(action.dueDate).toLocaleDateString("es-MX") : "No definida"} />
                  <InfoCard label="Cierre" value={action.closedAt ? new Date(action.closedAt).toLocaleDateString("es-MX") : "No cerrada"} />
                </div>
              </article>

              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-base font-semibold text-slate-950">Cambiar estado</h3>
                <p className="mt-1 text-sm text-slate-500">Actualiza el avance de la acción.</p>

                <div className="mt-6 space-y-4">
                  <select className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setStatus(event.target.value as ComplianceAction["status"])} value={status}>
                    <option value="open">Abierta</option>
                    <option value="in_progress">En proceso</option>
                    <option value="in_review">En revisión</option>
                    <option value="closed">Cerrada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>

                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={savingStatus} onClick={handleUpdateStatus} type="button">
                    <Save size={16} />
                    {savingStatus ? "Guardando..." : "Guardar estado"}
                  </button>
                </div>
              </article>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h3 className="text-base font-semibold text-slate-950">Análisis, plan y cierre</h3>
              <p className="mt-1 text-sm text-slate-500">Documenta la causa, el plan de acción y la evidencia de cierre.</p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <TextArea label="Causa raíz" value={rootCause} onChange={setRootCause} placeholder="Describe la causa raíz identificada" />
                <TextArea label="Plan de acción" value={actionPlan} onChange={setActionPlan} placeholder="Describe las actividades para corregir, prevenir o mejorar" />
                <TextArea label="Resultado de cierre" value={closureResult} onChange={setClosureResult} placeholder="Describe el resultado obtenido" />
                <TextArea label="Evidencia de cierre" value={closureEvidence} onChange={setClosureEvidence} placeholder="Describe o referencia la evidencia del cierre" />
                <div className="md:col-span-2">
                  <TextArea label="Comentario de verificación" value={verificationComment} onChange={setVerificationComment} placeholder="Indica si la acción fue efectiva y cómo se verificó" />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={savingAnalysis} onClick={handleSaveAnalysis} type="button">
                  <Save size={16} />
                  {savingAnalysis ? "Guardando..." : "Guardar análisis"}
                </button>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-base font-semibold text-slate-950">Comentarios de seguimiento</h3>
                <p className="mt-1 text-sm text-slate-500">Bitácora de avance de la acción.</p>

                {!action.comments || action.comments.length === 0 ? (
                  <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No hay comentarios registrados.</p>
                ) : (
                  <div className="mt-6 space-y-3">
                    {action.comments.map((item) => (
                      <div className="rounded-xl border border-slate-200 p-4" key={item.id}>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                          <MessageSquare size={16} />
                          {item.user?.name ?? "Usuario"}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.comment}</p>
                        <p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("es-MX")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-base font-semibold text-slate-950">Agregar comentario</h3>
                <p className="mt-1 text-sm text-slate-500">Registra avances, evidencias o decisiones.</p>

                <form className="mt-6 space-y-4" onSubmit={handleCreateComment}>
                  <textarea className="min-h-32 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setComment(event.target.value)} placeholder="Describe el avance de la acción" value={comment} />

                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={savingComment} type="submit">
                    <Save size={16} />
                    {savingComment ? "Guardando..." : "Agregar comentario"}
                  </button>
                </form>
              </article>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} />
    </div>
  );
}
