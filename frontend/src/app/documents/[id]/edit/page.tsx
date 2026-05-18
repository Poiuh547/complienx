"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, getStoredToken, type Document, type DocumentCategory } from "@/lib/api";

const statusOptions = [
  { value: "draft", label: "Borrador" },
  { value: "in_review", label: "En revisión" },
  { value: "approved", label: "Aprobado" },
  { value: "rejected", label: "Rechazado" },
  { value: "expired", label: "Vencido" },
  { value: "archived", label: "Archivado" }
];

type PageProps = {
  params: {
    id: string;
  };
};

export default function EditDocumentPage({ params }: PageProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [reviewDueDate, setReviewDueDate] = useState("");
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      window.location.href = "/";
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [documentResponse, categoriesResponse] = await Promise.all([
          apiFetch<{ document: Document }>(`/api/documents/${params.id}`, token),
          apiFetch<{ categories: DocumentCategory[] }>("/api/documents/categories", token)
        ]);

        const document = documentResponse.document;
        setTitle(document.title);
        setDescription(document.description ?? "");
        setCategoryId(document.categoryId ?? "");
        setStatus(document.status);
        setReviewDueDate(document.reviewDueDate ? document.reviewDueDate.slice(0, 10) : "");
        setCategories(categoriesResponse.categories);
      } catch {
        setError("No se pudo cargar el documento para edición.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      await apiFetch(`/api/documents/${params.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          description: description || null,
          categoryId: categoryId || null,
          status,
          reviewDueDate: reviewDueDate || null
        })
      });

      window.location.href = `/documents/${params.id}`;
    } catch {
      setError("No se pudo guardar el documento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell activeItem="Documentos" description="Modifica los datos generales del documento." title="Editar documento">
      <div className="mx-auto max-w-3xl space-y-6">
        <a className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600" href={`/documents/${params.id}`}>
          <ArrowLeft size={16} />
          Volver al detalle
        </a>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando documento...</p>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="title">Título</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  id="title"
                  onChange={(event) => setTitle(event.target.value)}
                  value={title}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="description">Descripción</label>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  id="description"
                  onChange={(event) => setDescription(event.target.value)}
                  value={description}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="category">Categoría</label>
                  <select
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    id="category"
                    onChange={(event) => setCategoryId(event.target.value)}
                    value={categoryId}
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="status">Estado</label>
                  <select
                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    id="status"
                    onChange={(event) => setStatus(event.target.value)}
                    value={status}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="reviewDueDate">Fecha de revisión</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  id="reviewDueDate"
                  onChange={(event) => setReviewDueDate(event.target.value)}
                  type="date"
                  value={reviewDueDate}
                />
              </div>

              {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <a className="inline-flex justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50" href={`/documents/${params.id}`}>
                  Cancelar
                </a>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  disabled={saving}
                  type="submit"
                >
                  <Save size={16} />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </AppShell>
  );
}
