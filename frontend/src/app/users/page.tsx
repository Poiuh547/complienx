import { PlaceholderPage } from "@/components/placeholder-page";

export default function UsersPage() {
  return (
    <PlaceholderPage
      activeItem="Usuarios"
      description="Administración de usuarios, roles y permisos para controlar quién puede crear, aprobar o consultar información."
      items={[
        "Crear y desactivar usuarios",
        "Asignar roles",
        "Consultar responsables",
        "Preparar permisos por módulo"
      ]}
      title="Usuarios"
    />
  );
}
