# Complienx

Complienx es una plataforma SaaS para ayudar a empresas pequeñas y medianas a organizar documentación, evidencias, aprobaciones, tareas y acciones de cumplimiento.

La primera versión se enfocará en un MVP simple y vendible:

- Dashboard ejecutivo
- Control documental
- Aprobaciones
- Acciones correctivas, preventivas y de mejora
- Tareas pendientes
- Usuarios y roles
- Configuración básica

## Objetivo del MVP

Construir una herramienta simple para que una empresa pueda:

1. Subir documentos de calidad o cumplimiento.
2. Controlar versiones.
3. Enviar documentos a aprobación.
4. Registrar quién aprobó o rechazó.
5. Dar seguimiento a acciones y tareas.
6. Tener una vista clara del estado general de cumplimiento.

## Stack definitivo

- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- ORM: Prisma
- Base de datos: PostgreSQL
- Autenticación: JWT inicialmente
- Almacenamiento de archivos: local en desarrollo; S3, Cloudflare R2 o compatible en producción

## Arquitectura

```txt
Next.js frontend → Express API → Prisma → PostgreSQL
```

## Estructura inicial

```txt
complienx/
├── docs/
│   ├── product.md
│   ├── mvp.md
│   ├── roadmap.md
│   ├── database.md
│   └── architecture.md
├── frontend/
│   └── README.md
├── backend/
│   └── README.md
├── database/
│   └── schema.sql
├── .gitignore
└── README.md
```

## Estado actual

Repositorio inicial del producto con stack definido. La siguiente etapa es crear los proyectos base de frontend y backend.
