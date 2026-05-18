import { PlaceholderPage } from "@/components/placeholder-page";

export default function ActionsPage() {
  return (
    <PlaceholderPage
      activeItem="Acciones"
      description="Módulo para registrar acciones correctivas, preventivas o de mejora, asignar responsables y dar seguimiento al cierre."
      items={[
        "Crear acciones correctivas, preventivas y de mejora",
        "Asignar responsable y fecha compromiso",
        "Agregar comentarios de seguimiento",
        "Cambiar estado hasta cierre"
      ]}
      title="Acciones"
    />
  );
}
