import { PlaceholderPage } from "@/components/placeholder-page";

export default function ApprovalsPage() {
  return (
    <PlaceholderPage
      activeItem="Aprobaciones"
      description="Bandeja para revisar documentos enviados a aprobación, aprobarlos, rechazarlos y dejar evidencia de la decisión."
      items={[
        "Ver documentos pendientes de revisión",
        "Aprobar o rechazar con comentarios",
        "Consultar historial de decisiones",
        "Generar tareas de seguimiento"
      ]}
      title="Aprobaciones"
    />
  );
}
