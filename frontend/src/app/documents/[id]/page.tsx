"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Edit, FileText, RefreshCw, Save, Send } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, getStoredToken, type Document } from "@/lib/api";

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  in_review: "En revisión",
  approved: "Aprobado",
  rejected: "Rechazado",
  expired: "Vencido",
  archived: "Archivado"
};

type PageProps = { params: { id: string } };

export default function DocumentDetailPage({ params }: PageProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingVersion, setSavingVersion] = useState(false);
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [error, setError] = useState("");
  const [versionNumber, setVersionNumber] = useState("1.0");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("application/pdf");
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
      const response = await apiFetch<{ document: Document }>(`/api/documents/${params.id}`, token);
      setDocument(response.document);
    } catch {
      setError("No se pudo cargar el documento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [params.id]);

  const handleSubmitForApproval = async () => {
    const token = getStoredToken();
    if (!token) return;

    setError("");
    setSubmittingApproval(true);

    try {
      await apiFetch(`/api/approvals/documents/${params.id}/submit`, token, { method: "POST" });
      await fetchDocument();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo enviar a revisión.");
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handleCreateVersion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const token = getStoredToken();
    if (!token) {
      window.location.href = "/";
      return;
    }

    if (!versionNumber.trim() || !fileName.trim() || !fileUrl.trim()) {
      setError("Número de versión, nombre de archivo y URL son obligatorios.");
      return;
    }

    setSavingVersion(true);

    try {
      await apiFetch(`/api/documents/${params.id}/versions`, token, {
        method: "POST",
        body: JSON.stringify({
          versionNumber,
          fileName,
          fileUrl,
          fileType: fileType || undefined,
          changeNotes: changeNotes || undefined,
          setAsCurrent: true
        })
      });

      setVersionNumber("");
      setFileName("");
      setFileUrl("");
      setChangeNotes("");
      await fetchDocument();
    } catch {
      setError("No se pudo agregar la versión.");
    } finally {
      setSavingVersion(false);
    }
  };

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
              {submittingApproval ? "Enviando..." : "Enviar a revisión"}
            </button>
            <a className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700" href={`/documents/${params.id}/edit`}>
              <Edit size={16} />
              Editar
            </a>
          </div>
        </div>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

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
                    <p className="mt-4 break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{document.currentVersion.fileUrl}</p>
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
                            <p className="mt-1 text-sm text-slate-600">{version.fileName}</p>
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
                <h3 className="text-base font-semibold text-slate-950">Agregar versión</h3>
                <p className="mt-1 text-sm text-slate-500">Por ahora registra la URL del archivo. Después agregaremos carga real.</p>
                <form className="mt-6 space-y-4" onSubmit={handleCreateVersion}>
                  <Input label="Número de versión" value={versionNumber} onChange={setVersionNumber} placeholder="1.0" />
                  <Input label="Nombre del archivo" value={fileName} onChange={setFileName} placeholder="manual-calidad-v1.pdf" />
                  <Input label="URL del archivo" value={fileUrl} onChange={setFileUrl} placeholder="local://manual-calidad-v1.pdf" />
                  <Input label="Tipo de archivo" value={fileType} onChange={setFileType} placeholder="application/pdf" />
                  <div>
                    <label className="text-sm font-medium text-slate-700">Notas de cambio</label>
                    <textarea className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => setChangeNotes(event.target.value)} placeholder="Versión inicial del documento" value={changeNotes} />
                  </div>
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300" disabled={savingVersion} type="submit">
                    <Save size={16} />
                    {savingVersion ? "Guardando..." : "Agregar versión"}
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

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} />
    </div>
  );
}
