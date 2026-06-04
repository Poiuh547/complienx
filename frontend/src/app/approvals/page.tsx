"use client";

import { useEffect, useState } from "react";
import { Check, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, getStoredToken, type Approval } from "@/lib/api";

const statusLabels: Record<string, string> = {
  approved: "Aprobado",
  rejected: "Rechazado",
  pending: "Pendiente"
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [history, setHistory] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchApprovals = async () => {
    const token = getStoredToken();

    if (!token) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [pendingResponse, historyResponse] = await Promise.all([
        apiFetch<{ approvals: Approval[] }>("/api/approvals/pending", token),
        apiFetch<{ approvals: Approval[] }>("/api/approvals/history", token)
      ]);

      setApprovals(pendingResponse.approvals);
      setHistory(historyResponse.approvals);
    } catch {
      setError("No se pudieron cargar las aprobaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const decideApproval = async (approvalId: string, decision: "approve" | "reject") => {
    const token = getStoredToken();
    if (!token) return;

    setProcessingId(approvalId);
    setProcessingAction(decision);
    setError("");
    setSuccess("");

    try {
      await apiFetch(`/api/approvals/${approvalId}/${decision}`, token, {
        method: "POST",
        body: JSON.stringify({ comment: comments[approvalId] || undefined })
      });

      setSuccess(decision === "approve" ? "Documento aprobado correctamente." : "Documento rechazado correctamente.");
      setComments((current) => ({ ...current, [approvalId]: "" }));
      await fetchApprovals();
    } catch {
      setError(decision === "approve" ? "No se pudo aprobar el documento." : "No se pudo rechazar el documento.");
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  return (
    <AppShell activeItem="Aprobaciones" description="Revisa documentos enviados a aprobación." title="Aprobaciones">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Pendientes</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{approvals.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Histórico</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{history.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Flujo activo</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">OK</p>
          </article>
        </section>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Bandeja de aprobación</h3>
              <p className="mt-1 text-sm text-slate-500">Documentos pendientes de decisión.</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={loading} onClick={fetchApprovals} type="button">
              <RefreshCw size={16} />
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {error ? <p className="m-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {success ? <p className="m-6 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p> : null}

          {loading ? (
            <div className="p-6 text-sm text-slate-500">Cargando aprobaciones...</div>
          ) : approvals.length === 0 ? (
            <div className="p-12 text-center">
              <h4 className="text-base font-semibold text-slate-950">No hay aprobaciones pendientes</h4>
              <p className="mt-2 text-sm text-slate-500">Cuando envíes un documento a revisión, aparecerá aquí.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {approvals.map((approval) => {
                const isProcessing = processingId === approval.id;

                return (
                  <article className="p-6" key={approval.id}>
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-blue-600">Pendiente de aprobación</p>
                        <h4 className="mt-2 text-lg font-semibold text-slate-950">{approval.document?.title ?? "Documento sin título"}</h4>
                        <p className="mt-1 text-sm text-slate-500">Versión {approval.documentVersion?.versionNumber ?? "sin versión"} · {approval.documentVersion?.fileName ?? "sin archivo"}</p>
                        <p className="mt-1 text-sm text-slate-500">Responsable: {approval.document?.owner?.name ?? "Sin responsable"}</p>
                        <a className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700" href={`/documents/${approval.documentId}`}>Ver documento</a>
                      </div>

                      <div className="w-full max-w-xl space-y-3">
                        <textarea className="min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50" disabled={isProcessing} onChange={(event) => setComments((current) => ({ ...current, [approval.id]: event.target.value }))} placeholder="Comentario de aprobación o rechazo" value={comments[approval.id] ?? ""} />
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={isProcessing} onClick={() => decideApproval(approval.id, "reject")} type="button">
                            {isProcessing && processingAction === "reject" ? "Rechazando..." : "Rechazar"}
                          </button>
                          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300" disabled={isProcessing} onClick={() => decideApproval(approval.id, "approve")} type="button">
                            <Check size={16} />
                            {isProcessing && processingAction === "approve" ? "Aprobando..." : "Aprobar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-950">Historial de aprobaciones</h3>
            <p className="mt-1 text-sm text-slate-500">Últimas aprobaciones y rechazos registrados.</p>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-slate-500">Cargando historial...</div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center">
              <h4 className="text-base font-semibold text-slate-950">Aún no hay historial</h4>
              <p className="mt-2 text-sm text-slate-500">Las aprobaciones decididas aparecerán en esta sección.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((approval) => (
                <article className="p-6" key={approval.id}>
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <span className={approval.status === "approved" ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700" : "rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700"}>
                        {statusLabels[approval.status] ?? approval.status}
                      </span>
                      <h4 className="mt-3 text-lg font-semibold text-slate-950">{approval.document?.title ?? "Documento sin título"}</h4>
                      <p className="mt-1 text-sm text-slate-500">Versión {approval.documentVersion?.versionNumber ?? "sin versión"} · {approval.documentVersion?.fileName ?? "sin archivo"}</p>
                      <p className="mt-1 text-sm text-slate-500">Decisión por: {approval.approver?.name ?? "Sin responsable"}</p>
                      <p className="mt-1 text-sm text-slate-500">Fecha: {approval.decidedAt ? new Date(approval.decidedAt).toLocaleString("es-MX") : "No disponible"}</p>
                      {approval.comment ? <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">{approval.comment}</p> : null}
                    </div>

                    <a className="inline-flex justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" href={`/documents/${approval.documentId}`}>
                      Ver documento
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
