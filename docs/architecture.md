# Arquitectura de Complienx

## Stack definitivo

Complienx se desarrollará como un monorepo con frontend, backend y scripts de base de datos.

```txt
Next.js frontend → Express API → Prisma → PostgreSQL
```

## Frontend

Tecnologías:

- Next.js
- React
- TypeScript
- Tailwind CSS

Responsabilidades:

- Login.
- Dashboard.
- Administración de documentos.
- Bandeja de aprobaciones.
- Gestión de acciones.
- Tareas pendientes.
- Usuarios y configuración.

## Backend

Tecnologías:

- Node.js
- Express
- TypeScript
- Prisma
- JWT

Responsabilidades:

- API REST.
- Autenticación.
- Autorización por roles.
- Reglas de negocio.
- Gestión de documentos y versiones.
- Gestión de aprobaciones.
- Gestión de acciones y tareas.
- Registro de actividad.

## Base de datos

Tecnología:

- PostgreSQL

Entidades principales:

- users
- document_categories
- documents
- document_versions
- document_approvals
- actions
- action_comments
- tasks
- activity_log

## Organización del repositorio

```txt
complienx/
├── frontend/
├── backend/
├── database/
└── docs/
```

## Estrategia de desarrollo

1. Crear backend base con Express, TypeScript y Prisma.
2. Crear conexión con PostgreSQL.
3. Crear autenticación básica con JWT.
4. Crear CRUD inicial de documentos.
5. Crear frontend base con Next.js.
6. Integrar login y dashboard.
7. Agregar aprobaciones, acciones y tareas.
