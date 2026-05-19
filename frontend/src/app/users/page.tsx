"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch, getStoredToken, type User } from "@/lib/api";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  collaborator: "Colaborador",
  auditor: "Auditor / consulta"
};

const statusLabels: Record<string, string> = {
  active: "Activo",
  inactive: "Inactivo"
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("collaborator");

  const fetchUsers = async () => {
    const token = getStoredToken();

    if (!token) {
      window.location.href = "/";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiFetch<{ users: User[] }>("/api/users", token);
      setUsers(response.users);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const activeUsers = useMemo(() => users.filter((user) => user.status === "active").length, [users]);
  const adminUsers = useMemo(() => users.filter((user) => user.role === "admin").length, [users]);

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const token = getStoredToken();
    if (!token) {
      window.location.href = "/";
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Nombre, correo y contraseña son obligatorios.");
      return;
    }

    setSaving(true);

    try {
      await apiFetch("/api/users", token, {
        method: "POST",
        body: JSON.stringify({ name, email, password, role })
      });

      setName("");
      setEmail("");
      setPassword("");
      setRole("collaborator");
      await fetchUsers();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo crear el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async (userId: string, values: Partial<Pick<User, "role" | "status">>) => {
    const token = getStoredToken();
    if (!token) return;

    setUpdatingId(userId);
    setError("");

    try {
      await apiFetch(`/api/users/${userId}`, token, {
        method: "PATCH",
        body: JSON.stringify(values)
      });
      await fetchUsers();
    } catch {
      setError("No se pudo actualizar el usuario.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AppShell activeItem="Usuarios" description="Administración básica de usuarios, roles y estatus." title="Usuarios">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Usuarios totales</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{users.length}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Activos</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{activeUsers}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Administradores</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{adminUsers}</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <article className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Listado de usuarios</h3>
                <p className="mt-1 text-sm text-slate-500">Consulta y administra los usuarios de Complienx.</p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={fetchUsers}
                type="button"
              >
                <RefreshCw size={16} />
                Actualizar
              </button>
            </div>

            {error ? <p className="m-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

            {loading ? (
              <div className="p-6 text-sm text-slate-500">Cargando usuarios...</div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <h4 className="text-base font-semibold text-slate-950">No hay usuarios registrados</h4>
                <p className="mt-2 text-sm text-slate-500">Crea el primer usuario para trabajar con responsables.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Rol</th>
                      <th className="px-6 py-4">Estatus</th>
                      <th className="px-6 py-4">Alta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr className="hover:bg-slate-50" key={user.id}>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-950">{user.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            disabled={updatingId === user.id}
                            onChange={(event) => handleUpdateUser(user.id, { role: event.target.value })}
                            value={user.role}
                          >
                            <option value="admin">Administrador</option>
                            <option value="collaborator">Colaborador</option>
                            <option value="auditor">Auditor / consulta</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            disabled={updatingId === user.id}
                            onChange={(event) => handleUpdateUser(user.id, { status: event.target.value })}
                            value={user.status}
                          >
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                          </select>
                          <p className="mt-1 text-xs text-slate-500">{statusLabels[user.status]}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-MX") : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-base font-semibold text-slate-950">Nuevo usuario</h3>
            <p className="mt-1 text-sm text-slate-500">Crea usuarios para asignar responsables y roles.</p>

            <form className="mt-6 space-y-4" onSubmit={handleCreateUser}>
              <div>
                <label className="text-sm font-medium text-slate-700">Nombre</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nombre del usuario"
                  value={name}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Correo</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="correo@empresa.com"
                  type="email"
                  value={email}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Contraseña temporal</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  type="password"
                  value={password}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Rol</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  onChange={(event) => setRole(event.target.value)}
                  value={role}
                >
                  <option value="admin">Administrador</option>
                  <option value="collaborator">Colaborador</option>
                  <option value="auditor">Auditor / consulta</option>
                </select>
                <p className="mt-2 text-xs text-slate-500">Rol seleccionado: {roleLabels[role]}</p>
              </div>

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                disabled={saving}
                type="submit"
              >
                {saving ? <Save size={16} /> : <Plus size={16} />}
                {saving ? "Guardando..." : "Crear usuario"}
              </button>
            </form>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
