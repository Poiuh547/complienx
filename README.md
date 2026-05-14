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

## Stack sugerido

- Frontend: React / Next.js
- Backend: Node.js con Express o NestJS
- Base de datos: PostgreSQL
- Autenticación: JWT inicialmente
- Almacenamiento de archivos: S3, Cloudinary o compatible

## Estructura inicial

```txt
complienx/
├── docs/
│   ├── product.md
│   ├── mvp.md
│   ├── roadmap.md
│   └── database.md
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

Repositorio inicial del producto. La siguiente etapa es decidir el stack definitivo y comenzar la implementación del backend y frontend.
