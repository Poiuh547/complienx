import { PlaceholderPage } from "@/components/placeholder-page";

export default function IndicatorsPage() {
  return (
    <PlaceholderPage
      activeItem="Indicadores"
      description="Vista para medir cumplimiento documental, acciones vencidas, tiempos de aprobación y desempeño general del sistema."
      items={[
        "Cumplimiento documental",
        "Acciones abiertas y vencidas",
        "Tiempo promedio de aprobación",
        "Indicadores de desempeño por periodo"
      ]}
      title="Indicadores"
    />
  );
}
