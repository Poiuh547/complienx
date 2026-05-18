"use client";

import { usePathname } from "next/navigation";
import { BarChart3, CheckSquare, FileText, Home, Settings, ShieldCheck, Users } from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Documentos", href: "/documents", icon: FileText },
  { label: "Aprobaciones", href: "/approvals", icon: ShieldCheck },
  { label: "Acciones", href: "/actions", icon: CheckSquare },
  { label: "Indicadores", href: "/indicators", icon: BarChart3 },
  { label: "Usuarios", href: "/users", icon: Users },
  { label: "Configuración", href: "/settings", icon: Settings }
];

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  activeItem?: string;
};

export function AppShell({ children, title, description, activeItem }: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-slate-950 p-6 text-white lg:block">
        <a href="/dashboard">
          <h1 className="text-lg font-semibold">Complienx</h1>
          <p className="mt-1 text-xs text-slate-400">Sistema de cumplimiento</p>
        </a>

        <nav className="mt-10 space-y-2 text-sm">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem ? item.label === activeItem : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <a
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-900"
                }`}
                href={item.href}
                key={item.label}
              >
                <Icon size={18} />
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      <section className="lg:pl-64">
        <header className="border-b border-slate-200 bg-white px-8 py-5">
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </header>

        <div className="p-8">{children}</div>
      </section>
    </main>
  );
}
