"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, getStoredToken, type Document, type DocumentCategory } from "@/lib/api";

export default function NewDocumentPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [reviewDueDate, setReviewDueDate] = useState("");
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      window.location.href = "/";
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await apiFetch<{ categories: DocumentCategory[] }>(
          "/api/documents/categories",
          token
        );
        setCategories(response.categories);
      } catch {
        setError("No se pudieron cargar las categorías.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

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
      const response = await apiFetch<{ document: Document }>("/api/documents", token, {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description || undefined,
          categoryId: categoryId || undefined,
          reviewDueDate: reviewDueDate || undefined
        })
      });

      window.location.href = `/documents/${response.document.id}`;
    } catch {
      setError("No se pudo crear el documento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      activeItem="Documentos"
      description="Registra un nuevo documento para control documental."
      title="Nuevo documento"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <a className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600" href="/documents">
          <ArrowLeft size={16} />
          Volver a documentos
        </a>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="title">
                Título del documento
              </label>
              <input
                id="title"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ej. Manual de Calidad"
                type="text"
                value={title}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="description">
                Descripción
              </label>
              <textarea
                id="description"
                className="mt-2 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe brevemente el propósito del documento"
                value={description}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="category">
                  Categoría
                </label>
                <select
                  id="category"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  disabled={loadingCategories}
                  onChange={(event) => setCategoryId(event.target.value)}
                  value={categoryId}
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700" htmlFor="reviewDueDate">
                  Fecha de revisión
                </label>
                <input
                  id="reviewDueDate"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) => setReviewDueDate(event.target.value)}
                  type="date"
                  value={reviewDueDate}
                />
              </div>
            </div>

            {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
              <a
                className="inline-flex justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                href="/documents"
              >
                Cancelar
              </a>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                disabled={saving}
                type="submit"
              >
                <Save size={16} />
                {saving ? "Guardando..." : "Guardar documento"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
