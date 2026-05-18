import { PlaceholderPage } from "@/components/placeholder-page";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      activeItem="Configuración"
      description="Configuración general de Complienx, categorías, parámetros del sistema y preferencias de la organización."
      items={[
        "Datos de la organización",
        "Categorías documentales",
        "Estados y prioridades",
        "Preferencias generales"
      ]}
      title="Configuración"
    />
  );
}
