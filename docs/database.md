# Modelo de base de datos inicial

## Entidades principales

### users

Usuarios del sistema.

Campos sugeridos:

- id
- name
- email
- password_hash
- role
- status
- created_at
- updated_at

### document_categories

Categorías para organizar documentos.

Campos sugeridos:

- id
- name
- description
- created_at
- updated_at

### documents

Registro principal del documento.

Campos sugeridos:

- id
- title
- description
- category_id
- owner_id
- status
- current_version_id
- review_due_date
- created_at
- updated_at

### document_versions

Versiones de cada documento.

Campos sugeridos:

- id
- document_id
- version_number
- file_url
- file_name
- file_type
- uploaded_by
- change_notes
- created_at

### document_approvals

Historial de aprobación o rechazo.

Campos sugeridos:

- id
- document_id
- document_version_id
- approver_id
- status
- comment
- decided_at
- created_at

### actions

Acciones correctivas, preventivas o de mejora.

Campos sugeridos:

- id
- title
- description
- type
- priority
- status
- owner_id
- due_date
- closed_at
- created_at
- updated_at

### action_comments

Comentarios de seguimiento para acciones.

Campos sugeridos:

- id
- action_id
- user_id
- comment
- created_at

### tasks

Pendientes asignados a usuarios.

Campos sugeridos:

- id
- title
- description
- type
- status
- assigned_to
- related_entity_type
- related_entity_id
- due_date
- created_at
- updated_at

### activity_log

Bitácora de eventos importantes.

Campos sugeridos:

- id
- user_id
- event_type
- entity_type
- entity_id
- description
- created_at

## Consideraciones

El modelo debe soportar multiempresa en una fase posterior. Para eso se puede agregar una tabla `organizations` y un campo `organization_id` en las entidades principales.
