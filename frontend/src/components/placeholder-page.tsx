import { AppShell } from "@/components/app-shell";

type PlaceholderPageProps = {
  title: string;
  description: string;
  activeItem: string;
  items?: string[];
};

export function PlaceholderPage({ title, description, activeItem, items = [] }: PlaceholderPageProps) {
  return (
    <AppShell activeItem={activeItem} description={description} title={title}>
      <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium text-blue-600">Próximo módulo</p>
        <h3 className="mt-3 text-2xl font-semibold text-slate-950">{title}</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>

        {items.length > 0 ? (
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700" key={item}>
                {item}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
