"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, type Document, getStoredToken } from "@/lib/api";

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  in_review: "En revisión",
  approved: "Aprobado",
  rejected: "Rechazado",
  expired: "Vencido",
  archived: "Archivado"
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    const token = getStoredToken();

    if (!token) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<{ documents: Document[] }>("/api/documents", token);
      setDocuments(response.documents);
    } catch {
      setError("No se pudieron cargar los documentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const activeDocuments = useMemo(
    () => documents.filter((document) => document.status !== "archived").length,
    [documents]
  );

  return (
    <AppShell
      activeItem="Documentos"
      description="Control documental, versiones y estados de revisión."
      title="Documentos"
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total de documentos</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{documents.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Documentos activos</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{activeDocuments}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">En revisión</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {documents.filter((document) => document.status === "in_review").length}
            </p>
          </article>
        </section>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-950">Listado de documentos</h3>
              <p className="mt-1 text-sm text-slate-500">Consulta los documentos registrados en Complienx.</p>
            </div>

            <div className="flex gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={fetchDocuments}
                type="button"
              >
                <RefreshCw size={16} />
                Actualizar
              </button>
              <a
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                href="/documents/new"
              >
                <Plus size={16} />
                Nuevo documento
              </a>
            </div>
          </div>

          {error ? <p className="m-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

          {loading ? (
            <div className="p-6 text-sm text-slate-500">Cargando documentos...</div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-2xl bg-slate-100 p-4 text-slate-500">
                <FileText size={28} />
              </div>
              <h4 className="mt-4 text-base font-semibold text-slate-950">Todavía no hay documentos</h4>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Crea el primer documento para comenzar a construir el control documental.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Documento</th>
                    <th className="px-6 py-4">Categoría</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4">Versión actual</th>
                    <th className="px-6 py-4">Responsable</th>
                    <th className="px-6 py-4">Revisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((document) => (
                    <tr className="hover:bg-slate-50" key={document.id}>
                      <td className="px-6 py-4">
                        <a className="font-medium text-slate-950 hover:text-blue-600" href={`/documents/${document.id}`}>
                          {document.title}
                        </a>
                        <p className="mt-1 text-xs text-slate-500">{document.description || "Sin descripción"}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{document.category?.name ?? "Sin categoría"}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {statusLabels[document.status] ?? document.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {document.currentVersion?.versionNumber ?? "Sin versión"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{document.owner?.name ?? "Sin responsable"}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {document.reviewDueDate ? new Date(document.reviewDueDate).toLocaleDateString("es-MX") : "No definida"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
