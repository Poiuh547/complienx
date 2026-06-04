"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, Edit, FileText, RefreshCw, Send, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { API_URL, apiFetch, getStoredToken, type Document, uploadFetch } from "@/lib/api";

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  in_review: "En revisión",
  approved: "Aprobado",
  rejected: "Rechazado",
  expired: "Vencido",
  archived: "Archivado"
};

type PageProps = { params: Promise<{ id: string }> };

export default function DocumentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingVersion, setSavingVersion] = useState(false);
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [versionNumber, setVersionNumber] = useState("1.0");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changeNotes, setChangeNotes] = useState("");

  const fetchDocument = async () => {
    const token = getStoredToken();
    if (!token) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<{ document: Document }>(`/api/documents/${id}`, token);
      setDocument(response.document);
    } catch {
      setError("No se pudo cargar el documento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const handleSubmitForApproval = async () => {
    const token = getStoredToken();
    if (!token) return;

    setError("");
    setSuccess("");
    setSubmittingApproval(true);

    try {
      await apiFetch(`/api/approvals/documents/${id}/submit`, token, { method: "POST" });
      await fetchDocument();
      setSuccess("Documento enviado a revisión correctamente.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo enviar a revisión.");
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleUploadVersion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = getStoredToken();
    if (!token) {
      window.location.href = "/";
      return;
    }

    if (!versionNumber.trim()) {
      setError("El número de versión es obligatorio.");
      return;
    }

    if (!selectedFile) {
      setError("Selecciona un archivo para subir.");
      return;
    }

    const formData = new FormData();
    formData.append("versionNumber", versionNumber);
    formData.append("changeNotes", changeNotes);
    formData.append("setAsCurrent", "true");
    formData.append("file", selectedFile);

    setSavingVersion(true);

    try {
      await uploadFetch(`/api/documents/${id}/versions/upload`, token, formData);
      setVersionNumber("");
      setSelectedFile(null);
      setChangeNotes("");
      const fileInput = window.document.getElementById("documentFile") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      await fetchDocument();
      setSuccess("Nueva versión subida correctamente.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo subir el archivo.");
    } finally {
      setSavingVersion(false);
    }
  };

  const submitButtonLabel = document?.status === "in_review" ? "En revisión" : submittingApproval ? "Enviando..." : "Enviar a revisión";

  return (
    <AppShell activeItem="Documentos" description="Detalle, versiones y trazabilidad del documento." title="Detalle del documento">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <a className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600" href="/documents">
            <ArrowLeft size={16} />
            Volver a documentos
          </a>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={fetchDocument} type="button">
              <RefreshCw size={16} />
              Actualizar
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300" disabled={!document?.currentVersionId || document?.status === "in_review" || submittingApproval} onClick={handleSubmitForApproval} type="button">
              <Send size={16} />
              {submitButtonLabel}
            </button>
            <a className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" href={`/documents/${id}/edit`}>
              <Edit size={16} />
              Editar
            </a>
          </div>
        </div>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p> : null}

        {loading ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Cargando documento...</p></section>
        ) : !document ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Documento no encontrado.</p></section>
        ) : (
          <>
            <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-blue-50 p-4 text-blue-600"><FileText size={28} /></div>
                  <div>
                    <p className="text-sm text-slate-500">Documento</p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-950">{document.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{document.description || "Sin descripción"}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <InfoCard label="Estado" value={statusLabels[document.status] ?? document.status} />
                  <InfoCard label="Categoría" value={document.category?.name ?? "Sin categoría"} />
                  <InfoCard label="Responsable" value={document.owner?.name ?? "Sin responsable"} />
                  <InfoCard label="Fecha de revisión" value={document.reviewDueDate ? new Date(document.reviewDueDate).toLocaleDateString("es-MX") : "No definida"} />
                </div>
              </article>

              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-base font-semibold text-slate-950">Versión actual</h3>
                {document.currentVersion ? (
                  <div className="mt-5 rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-950">Versión {document.currentVersion.versionNumber}</p>
                    <p className="mt-1 text-sm text-slate-600">{document.currentVersion.fileName}</p>
                    <p className="mt-1 text-xs text-slate-500">{document.currentVersion.fileType || "Tipo no definido"}</p>
                    <a className="mt-4 block break-all rounded-lg bg-slate-50 p-3 text-xs font-medium text-blue-600 hover:text-blue-700" href={`${API_URL}${document.currentVersion.fileUrl}`} target="_blank">
                      Abrir archivo
                    </a>
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Este documento todavía no tiene una versión registrada.</p>
                )}
              </article>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-base font-semibold text-slate-950">Historial de versiones</h3>
                <p className="mt-1 text-sm text-slate-500">Versiones registradas para este documento.</p>
                {!document.versions || document.versions.length === 0 ? (
                  <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">No hay versiones registradas.</p>
                ) : (
                  <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {document.versions.map((version) => (
                      <div className="p-4" key={version.id}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">Versión {version.versionNumber}</p>
                            <a className="mt-1 block text-sm font-medium text-blue-600 hover:text-blue-700" href={`${API_URL}${version.fileUrl}`} target="_blank">{version.fileName}</a>
                            {version.changeNotes ? <p className="mt-2 text-sm text-slate-500">{version.changeNotes}</p> : null}
                          </div>
                          {document.currentVersionId === version.id ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Actual</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-base font-semibold text-slate-950">Subir nueva versión</h3>
                <p className="mt-1 text-sm text-slate-500">Selecciona un PDF, Word, Excel o imagen para registrarlo como versión actual.</p>
                <form className="mt-6 space-y-4" onSubmit={handleUploadVersion}>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Número de versión</label>
                    <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setVersionNumber(event.target.value)} placeholder="1.0" value={versionNumber} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Archivo</label>
                    <input id="documentFile" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" />
                    {selectedFile ? <p className="mt-2 text-xs text-slate-500">Seleccionado: {selectedFile.name}</p> : null}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Notas de cambio</label>
                    <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setChangeNotes(event.target.value)} placeholder="Describe qué cambió en esta versión" value={changeNotes} />
                  </div>
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={savingVersion} type="submit">
                    <Upload size={16} />
                    {savingVersion ? "Subiendo..." : "Subir versión"}
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
