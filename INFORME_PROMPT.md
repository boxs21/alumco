# PROMPT PARA GENERAR INFORME FINAL — PROYECTO ALUMCO

Pega TODO este archivo en una sesión nueva de Claude (claude.ai). Recibirás el informe completo en Markdown.

---

## INSTRUCCIÓN PARA CLAUDE

Eres redactor técnico académico. Tu tarea es redactar el **informe final completo** de un proyecto de software universitario, en español formal, en un solo bloque Markdown. Usa TODOS los datos del proyecto que se entregan a continuación. No pidas contexto adicional — todo está aquí.

Reglas obligatorias:
- Salida: un único archivo Markdown (sin separar en partes)
- Diagramas: usa bloques ` ```mermaid ``` ` (flowchart para BPMN, classDiagram, sequenceDiagram, erDiagram, C4Context para despliegue)
- Tablas Markdown para: RF, RNF, trazabilidad, RACI, riesgos, pruebas
- Tono: académico, impersonal, sin frases IA tipo "es importante señalar que"
- Donde se necesite dato que yo no proporciono (nombre de directora, rut, fecha exacta de inicio), escribe `// COMPLETAR: [descripción]`
- Bibliografía al final, formato APA 7, mínimo 8 fuentes (incluir: Next.js docs, Supabase docs, Sommerville Ingeniería de Software 10ª ed, PMBOK 7, ISO/IEC 25010, Pressman, Tailwind CSS docs, Vercel docs)
- No acortes ninguna sección. Cada punto de la plantilla debe tener contenido real del proyecto.

---

## DATOS DEL PROYECTO

### Identidad
- **Nombre sistema:** ALUMCO — Plataforma Web de Capacitación Interna
- **Organización cliente:** ONG ALUMCO (organización sin fines de lucro, trabajo social, dos residencias)
- **Sedes:** Concepción (slug: CONCEPCION) y Coyhaique (slug: COYHAIQUE)
- **URL producción:** https://alumco-seven.vercel.app
- **Tipo de proyecto:** Aplicación web, prototipo funcional

### Stack tecnológico
| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework frontend/backend | Next.js (App Router) | 16.2.1 |
| Librería UI | React | 19.2.4 |
| Lenguaje | TypeScript | 5 |
| Estilos | Tailwind CSS | 4 |
| Componentes UI | shadcn/ui + Radix UI | — |
| Íconos | lucide-react | 1.6.0 |
| Notificaciones | sonner | 2.0.7 |
| Base de datos | Supabase (PostgreSQL) | — |
| Autenticación | Supabase Auth | — |
| Seguridad BD | Row Level Security (RLS) | — |
| Generación PDF | @react-pdf/renderer | 4.5.1 |
| Hosting | Vercel | — |
| Repositorio | Git |  — |

### Roles del sistema
| Rol | Descripción | Acceso |
|-----|-------------|--------|
| ADMIN | Administrador de la plataforma | `/admin/**` completo |
| PROFESOR | Gestor de capacitaciones | `/admin/**` excepto `/admin/personal` |
| COLLABORATOR | Colaborador de la ONG | `/portal/**` |

Control de roles en middleware Next.js (`middleware.ts`).

### Esquema de base de datos — 11 tablas (Supabase / PostgreSQL)

#### `sedes`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | gen_random_uuid() |
| nombre | text | Nombre legible |
| slug | text UNIQUE | CONCEPCION / COYHAIQUE |
| direccion | text nullable | Dirección física |
| created_at | timestamptz | — |

Registros fijos: solo Concepción y Coyhaique.

#### `areas`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | — |
| name | text UNIQUE | Nombre del área |
| created_at | timestamptz | — |

Administrables por ADMIN.

#### `profiles`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | FK → auth.users.id |
| name | text | Nombre completo |
| email | text UNIQUE | — |
| role | text | ADMIN / PROFESOR / COLLABORATOR |
| area | text nullable | Ej: Cuidado, Enfermería |
| sede_id | uuid nullable | FK → sedes.id |
| active | boolean | default true |
| created_at | timestamptz | — |

Trigger `on_auth_user_created` crea profile automáticamente.
RLS: cada usuario solo lee su propio perfil; ADMIN lee todos.

#### `trainings`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | — |
| title | text | — |
| description | text nullable | — |
| target_area | text nullable | Área objetivo |
| status | text | DRAFT / PUBLISHED / ARCHIVED |
| sede_id | uuid nullable | NULL = aplica ambas sedes |
| created_by | uuid | FK → profiles.id |
| created_at | timestamptz | — |

#### `files`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | — |
| training_id | uuid | FK → trainings.id (cascade delete) |
| name | text | Nombre archivo |
| type | text | PDF / VIDEO / PRESENTATION / IMAGE |
| url | text | YouTube, Drive o URL directa |
| order | int | default 0 |
| created_at | timestamptz | — |

#### `quizzes`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | — |
| training_id | uuid UNIQUE | FK → trainings.id (1 quiz por capacitación) |
| passing_score | float | default 60 (porcentaje mínimo para aprobar) |
| max_attempts | int | default 3 |
| created_at | timestamptz | — |

#### `questions`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | — |
| quiz_id | uuid | FK → quizzes.id (cascade delete) |
| text | text | Texto de la pregunta |
| points | float | default 1 |
| order | int | default 0 |

#### `options`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | — |
| question_id | uuid | FK → questions.id (cascade delete) |
| text | text | Texto alternativa |
| is_correct | boolean | Solo una correcta por pregunta |

#### `assignments`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | — |
| training_id | uuid | FK → trainings.id |
| user_id | uuid nullable | FK → profiles.id. NULL si grupal |
| target_type | text | ALL / SEDE / AREA / INDIVIDUAL |
| target_sede_id | uuid nullable | FK → sedes.id (solo SEDE) |
| target_area | text nullable | Solo AREA |
| due_date | timestamptz nullable | Fecha límite |
| status | text | PENDING / IN_PROGRESS / COMPLETED |
| created_at | timestamptz | — |

Lógica: ALL → todos los activos; SEDE → todos de la sede; AREA → todos del área; INDIVIDUAL → user_id específico.

#### `attempts`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | — |
| user_id | uuid | FK → profiles.id |
| quiz_id | uuid | FK → quizzes.id |
| score | float nullable | Porcentaje 0–100 |
| passed | boolean nullable | true si score ≥ passing_score |
| attempt_number | int | 1, 2, 3… |
| started_at | timestamptz | — |
| finished_at | timestamptz nullable | NULL si no terminó |

#### `certificates`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | — |
| user_id | uuid | FK → profiles.id |
| training_id | uuid | FK → trainings.id |
| attempt_id | uuid nullable UNIQUE | FK → attempts.id |
| verification_code | text UNIQUE | UUID como código de verificación |
| pdf_url | text nullable | URL del PDF (pendiente) |
| issued_at | timestamptz | — |

#### `sessions`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | uuid PK | — |
| training_id | uuid | FK → trainings.id |
| sede_id | uuid nullable | FK → sedes.id |
| start_date | date | — |
| end_date | date | — |
| modality | text | PRESENCIAL / ONLINE |
| notes | text nullable | — |
| created_at | timestamptz | — |

### Relaciones clave
```
auth.users ──── profiles (1:1)
profiles ──── assignments (1:N)
profiles ──── attempts (1:N)
profiles ──── certificates (1:N)
sedes ──── profiles (1:N)
sedes ──── trainings (1:N, nullable = global)
trainings ──── files (1:N)
trainings ──── quizzes (1:1)
trainings ──── assignments (1:N)
trainings ──── sessions (1:N)
quizzes ──── questions (1:N)
questions ──── options (1:N)
attempts ──── certificates (1:1 nullable)
```

### Estructura de rutas (Next.js App Router)
```
app/
├── (auth)/
│   ├── login/            → página de login
│   └── forgot-password/  → recuperar contraseña
├── admin/
│   ├── dashboard/        → métricas y resumen general
│   ├── capacitaciones/   → listado capacitaciones
│   │   ├── nueva/        → crear capacitación
│   │   └── [id]/
│   │       ├── (detalle + editar)
│   │       └── asignar/  → asignar capacitación
│   ├── colaboradores/
│   │   ├── (listado)
│   │   └── [id]/         → detalle colaborador
│   ├── personal/         → gestión de personal (solo ADMIN)
│   ├── calendario/       → sesiones
│   └── reportes/         → reportes de capacitaciones
├── profesor/
│   ├── dashboard/
│   ├── capacitaciones/   → igual que admin excepto personal
│   └── calendario/
├── portal/
│   ├── (home)            → mis capacitaciones asignadas
│   ├── capacitacion/[id]/→ ver material + hacer quiz
│   ├── historial/        → capacitaciones completadas + certificados
│   └── calendario/
└── api/
    ├── admin/
    │   ├── areas/         → GET, POST (áreas)
    │   ├── areas/[id]/    → PATCH, DELETE
    │   ├── colaboradores/[id]/ → PATCH (editar colaborador)
    │   ├── create-user/   → POST (crear usuario Supabase Auth + profile)
    │   └── users/         → GET (listar usuarios)
    └── certificate/[id]/  → GET (descargar PDF certificado)
```

### Componentes principales
```
components/
├── layout/
│   ├── Sidebar.tsx       → navegación lateral admin/profesor
│   ├── Topbar.tsx        → barra superior
│   └── BottomNav.tsx     → navegación inferior móvil (portal)
├── shared/
│   ├── TrainingCard.tsx  → tarjeta de capacitación reutilizable
│   ├── StatCard.tsx      → tarjeta de métrica
│   ├── SedeFilter.tsx    → filtro Todas/Concepción/Coyhaique
│   ├── SedeBadge.tsx     → badge de sede
│   ├── EmptyState.tsx    → estado vacío
│   ├── Skeleton.tsx      → loading skeleton
│   ├── DarkModeToggle.tsx→ toggle tema oscuro/claro
│   ├── FontSizeSwitcher.tsx → cambiar tamaño fuente
│   └── ThemeSwitcher.tsx → cambiar tema de color
├── certificate/
│   └── CertificatePreviewModal.tsx → preview certificado PDF
└── ui/                   → shadcn/ui (button, card, input, dialog, etc.)
```

### Funcionalidades completadas
1. Autenticación completa (login, logout, recuperación contraseña)
2. Control de acceso por rol en middleware (ADMIN / PROFESOR / COLLABORATOR)
3. Dashboard admin con métricas (capacitaciones, colaboradores, completados)
4. CRUD de capacitaciones (crear, editar, publicar, archivar)
5. Subida de material multimedia a capacitaciones (PDFs, links videos YouTube/Drive)
6. Editor de quiz (preguntas, opciones, puntaje mínimo, intentos máximos)
7. Asignación masiva de capacitaciones (ALL / SEDE / AREA / INDIVIDUAL)
8. Portal colaborador: listado de capacitaciones asignadas, filtros
9. Visualización de material (PDFs embed, videos YouTube/Drive iframe)
10. Realización de evaluaciones (quiz con límite intentos, cálculo puntaje)
11. Generación de certificado PDF (con @react-pdf/renderer)
12. Preview y descarga de certificado PDF
13. Historial de capacitaciones completadas con certificados
14. Gestión de personal (crear colaboradores, editar rol/sede/área)
15. Gestión de áreas (crear, editar, eliminar)
16. Calendario de sesiones presenciales/online
17. Reportes de seguimiento por capacitación
18. Diseño responsive (móvil + escritorio)
19. Dark mode / Light mode
20. Múltiples temas de color + ajuste tamaño fuente (accesibilidad)

### Funcionalidades pendientes (fuera del prototipo actual)
- Export Excel real (actualmente solo visualización en tabla)
- Generación automática de PDF para `certificates.pdf_url`
- Notificaciones email al asignar capacitaciones
- App móvil nativa
- Módulo de pagos (excluido del alcance)

### Problemática que resuelve
Antes del sistema, la ONG ALUMCO gestionaba capacitaciones de personal mediante planillas Excel, correo electrónico y documentos físicos. Problemas detectados:
- Información dispersa en múltiples archivos sin versionado
- Sin trazabilidad de quién completó qué capacitación
- Certificados generados manualmente en Word
- Sin seguimiento del progreso de colaboradores
- Gestión separada por sede sin visión global
- Procesos lentos para asignar y validar capacitaciones

---

## PLANTILLA DEL INFORME — 22 SECCIONES

Redacta el informe completo siguiendo EXACTAMENTE esta estructura:

---

### Portada
// COMPLETAR: institución educativa, carrera, docente, integrantes del equipo, fecha entrega

### Índice / Tabla de contenidos
(genera tabla de contenidos con números de sección)

---

## 1. Abstract
Resumen ejecutivo en 5–10 líneas: problema, solución propuesta, metodología, resultados del prototipo, beneficios esperados.

---

## 2. Introducción

### 2.1 Contexto institucional
Describe ONG ALUMCO: tipo de organización, función, programa de capacitación interno, sedes Concepción y Coyhaique.

### 2.2 Propósito de la aplicación
Por qué se desarrolla ALUMCO: digitalizar gestión de capacitaciones, centralizar datos, eliminar procesos manuales, dar trazabilidad.

### 2.3 Problemática actual
Dificultades antes del sistema: planillas Excel, correo, documentos físicos, sin trazabilidad, certificados manuales.

### 2.4 Modelo de desarrollo de software aplicado
Metodología usada: Iterativa/Incremental. Describe brevemente por qué se eligió y cómo se aplicó al proyecto.

---

## PARTE I – ANÁLISIS

## 3. Situación Actual (AS-IS)

### 3.1 Descripción del proceso actual y BPMN AS-IS
Describe proceso manual actual. Incluye diagrama BPMN AS-IS en Mermaid (flowchart simulando BPMN: coordinador detecta necesidad → genera planilla → envía por correo → colaborador recibe → asiste → coordinador registra manualmente → genera certificado Word → envía por correo).

### 3.2 Dificultades y limitaciones detectadas
Lista numerada de problemas: dispersión de info, sin trazabilidad, demoras, sin indicadores, procesos no estandarizados, duplicación de datos.

### 3.3 Necesidades identificadas por usuarios internos
Necesidades reales: centralizar datos, mejorar comunicación, simplificar acceso, automatizar flujos, ver historial colaboradores.

---

## 4. Objetivos del Proyecto

### 4.1 Objetivo general
Una frase: digitalizar y centralizar la gestión de capacitaciones internas de ONG ALUMCO para mejorar trazabilidad y eficiencia.

### 4.2 Objetivos específicos
Lista 6–8 objetivos concretos (registrar usuarios, gestionar capacitaciones, asignar por sede/área, evaluar con quiz, emitir certificados, visualizar historial, generar reportes, controlar acceso por rol).

---

## 5. Alcance del Proyecto

### 5.1 Alcance funcional
Qué hace el sistema: autenticación, gestión capacitaciones, material multimedia, quizzes, asignación masiva, certificados, historial, reportes, calendario, gestión personal.

### 5.2 Alcance técnico
Tecnologías usadas, arquitectura Next.js + Supabase, despliegue Vercel, BD PostgreSQL, autenticación JWT/Supabase Auth, RLS.

### 5.3 Exclusiones del sistema
Qué NO hace: pagos, app móvil nativa, notificaciones email, export Excel real, módulos de RRHH externos.

---

## 6. Estudio de Factibilidad

### 6.1 Factibilidad técnica
Tecnologías elegidas (Next.js, Supabase, Vercel) son maduras, con documentación extensa, gratuitas en tier inicial. Equipo con conocimiento en React/TypeScript.

### 6.2 Factibilidad operativa
Usuarios (ADMIN, PROFESOR, COLLABORATOR) pueden usar el sistema con mínima capacitación. Interfaz web accesible desde cualquier dispositivo con navegador.

### 6.3 Factibilidad económica
Stack gratuito (Vercel free tier, Supabase free tier). Costo = tiempo de desarrollo. Sin licencias pagas.

### 6.4 Factibilidad legal
Datos internos de la ONG. Supabase cumple GDPR. RLS protege acceso por usuario. Sin datos sensibles de terceros.

### 6.5 Factibilidad ambiental
Infraestructura en la nube (Vercel + Supabase), elimina papel en procesos de capacitación. Reducción de impresión de certificados y planillas físicas.

---

## PARTE II – DEFINICIÓN DEL SISTEMA

## 7. Levantamiento de Requisitos

### 7.1 Requerimientos funcionales
Tabla Markdown con columnas: ID | Nombre | Descripción | Prioridad
Incluir mínimo 20 RF cubriendo: autenticación, roles, capacitaciones CRUD, material, quiz, asignación, intentos, certificados, historial, reportes, personal, áreas, calendario, filtros, sede, dark mode, PDF.

### 7.2 Requerimientos no funcionales
Tabla Markdown con columnas: ID | Categoría | Descripción
Incluir: rendimiento (carga < 3s), seguridad (RLS, JWT), usabilidad (responsive, dark mode), disponibilidad (Vercel 99.9%), mantenibilidad (TypeScript, componentes reutilizables), portabilidad (web, cualquier navegador moderno), accesibilidad (tamaño fuente ajustable).

---

## 8. Casos de Uso del Sistema

### 8.1 Identificación de actores
Lista actores: ADMIN, PROFESOR, COLLABORATOR, Sistema (Supabase Auth, @react-pdf/renderer), Tiempo (asignaciones con due_date).

### 8.2 Diagrama de casos de uso
Incluir diagrama Mermaid (flowchart o formato UML aproximado) mostrando actores y sus casos de uso principales.

### 8.3 Casos de uso narrativos
Describe al menos 5 casos de uso en formato tabla: Nombre | Actores | Precondición | Flujo principal | Flujo alternativo | Postcondición.
Casos sugeridos: CU-01 Login, CU-02 Crear capacitación, CU-03 Asignar capacitación, CU-04 Realizar quiz, CU-05 Descargar certificado.

---

## PARTE III – PROPUESTA DE SOLUCIÓN (TO-BE)

## 9. Descripción General de la Solución y Modelado de Procesos

### 9.1 Descripción del sistema propuesto
Qué es ALUMCO, para qué sirve, cómo soluciona los problemas AS-IS.

### 9.2 Flujo del sistema propuesto (BPMN TO-BE)
Diagrama Mermaid (flowchart) del proceso digitalizado: Admin crea capacitación → publica → asigna → colaborador recibe en portal → ve material → hace quiz → aprueba → sistema genera certificado automático → colaborador descarga PDF.

### 9.3 Funcionalidades
Lista de todas las funcionalidades implementadas (usar lista de "Funcionalidades completadas" de los datos).

### 9.4 Beneficios para la operación institucional
Beneficios concretos: trazabilidad completa, certificados automáticos, visión por sede, reducción tiempo administrativo, historial auditable.

---

## 10. Arquitectura del Sistema

### 10.1 Arquitectura lógica
Componentes: Frontend (Next.js App Router, React 19), Backend (API Routes Next.js), Base de datos (Supabase PostgreSQL), Autenticación (Supabase Auth), Almacenamiento (Supabase Storage para PDFs), CDN (Vercel Edge Network).

### 10.2 Arquitectura física
Despliegue en: Vercel (frontend + API serverless), Supabase (PostgreSQL + Auth + Storage, región sur-América o US).

### 10.3 Diagrama de Despliegue
Diagrama Mermaid (C4Context o flowchart) mostrando: Navegador → Vercel Edge → Next.js Serverless Functions → Supabase (Auth / DB / Storage).

---

## PARTE IV – DISEÑO DEL SISTEMA

## 11. Modelado UML

### 11.1 Diagrama de clases
Diagrama Mermaid `classDiagram` con entidades principales: Profile, Training, File, Quiz, Question, Option, Assignment, Attempt, Certificate, Session, Sede, Area, y sus relaciones.

### 11.2 Diagrama de actividades
Diagrama Mermaid `flowchart TD` mostrando flujo de trabajo: desde login hasta descarga de certificado.

### 11.3 Diagrama de secuencia
Diagrama Mermaid `sequenceDiagram` para el proceso: Colaborador → Sistema → Supabase Auth → DB → generación certificado. Incluye al menos el caso "Realizar quiz y obtener certificado".

---

## 12. Modelos de Datos

### 12.1 Modelo entidad–relación
Descripción de entidades principales y sus relaciones (usar datos del esquema de BD).

### 12.2 Modelo lógico
Diagrama Mermaid `erDiagram` con todas las tablas, atributos clave y relaciones (FK).

### 12.3 Modelo físico
Descripción del motor elegido (PostgreSQL vía Supabase), tipos de datos reales usados (uuid, text, float, boolean, timestamptz, int), índices y restricciones (UNIQUE, cascade delete, RLS).

---

## 13. Diseño de Interfaz y Experiencia de Usuario

### 13.1 Wireframes y mockups
Describe las vistas principales del sistema con texto (portada login, dashboard admin, listado capacitaciones, vista capacitación con material y quiz, historial colaborador, generación certificado). Indica que los wireframes de alta fidelidad están en producción en https://alumco-seven.vercel.app.

### 13.2 Lineamientos institucionales de interfaz
Paleta de colores: azul principal #2B4BA8, azul claro #EEF2FF, naranja advertencia #f9a620, rojo peligro #E8445A, fondo #FAFBFF.
Tipografía: sans-serif del sistema.
Modo oscuro y claro soportados.
Ajuste de tamaño fuente para accesibilidad.
Responsive design (móvil + escritorio).
Componentes shadcn/ui con personalización de colores institucionales.

---

## PARTE V – IMPLEMENTACIÓN

## 14. Desarrollo e Implementación del Prototipo

### 14.1 Estado actual de la implementación
Todas las funcionalidades principales están desarrolladas y en producción. Ver lista de funcionalidades completadas.

### 14.2 Funcionalidades completadas
(Listar las 20 funcionalidades completadas de los datos del proyecto con descripción breve de cada una.)

### 14.3 Limitaciones actuales del prototipo
Export Excel real pendiente, pdf_url en certificates aún NULL (PDF se genera en cliente, no se persiste URL), notificaciones email no implementadas.

---

## PARTE VI – GESTIÓN DEL PROYECTO

## 15. Planificación del Proyecto

### 15.1 Cronograma y actividades
Tabla Markdown con fases: Análisis de requisitos, Diseño BD, Configuración stack, Desarrollo autenticación y roles, Módulo capacitaciones, Módulo quiz, Módulo asignaciones, Módulo certificados, Módulo reportes, Módulo personal, Pruebas, Despliegue. Asigna semanas aproximadas. // COMPLETAR: fechas reales del proyecto

### 15.2 Matriz RACI
Tabla con actividades y roles (Responsable / Aprueba / Consultado / Informado). // COMPLETAR: nombres reales del equipo

---

## 16. Gestión de Riesgos

### 16.1 Matriz de Riesgo
Tabla Markdown: ID | Riesgo | Probabilidad | Impacto | Severidad | Mitigación
Incluir riesgos: cambios de requisitos, curva aprendizaje Supabase RLS, límites tier gratuito Vercel/Supabase, pérdida de datos, vulnerabilidades de seguridad, baja adopción usuarios, deuda técnica.

---

## PARTE VII – VALIDACIÓN Y EVALUACIÓN

## 17. Matriz de Trazabilidad (RF y RNF)
Tabla Markdown: RF/RNF ID | Descripción | Caso de uso | Componente implementado | Estado (Implementado/Pendiente)

---

## 18. Plan de Pruebas
Tabla Markdown: ID | Tipo | Descripción | Entrada | Resultado esperado | Estado
Incluir pruebas: login correcto, login fallido, acceso sin rol correcto, crear capacitación, asignar capacitación, realizar quiz y aprobar, realizar quiz y reprobar, agotar intentos, descargar certificado, ver historial, responsive en móvil.

---

## 19. Evaluación del Prototipo

### 19.1 Desempeño del sistema
Tiempo de carga estimado (<3s), estabilidad en Vercel (serverless), RLS protege datos correctamente, generación PDF en cliente funcional.

### 19.2 Recomendaciones para versión final
Implementar export Excel, persistir PDF en Supabase Storage, notificaciones email con Resend/SendGrid, pruebas E2E con Playwright, mejora del sistema de reportes con gráficos, considerar app móvil con Expo.

---

## 20. Conclusiones
Resume: problema resuelto, tecnologías elegidas y su justificación, funcionalidades logradas, aprendizajes del equipo, potencial futuro del sistema.

---

## 21. Bibliografía (Norma APA 7)
Incluir mínimo 8 referencias en APA 7:
- Next.js docs
- Supabase docs
- Sommerville, I. (2016). *Ingeniería de Software* (10ª ed.)
- Project Management Institute. (2021). *PMBOK Guide* (7ª ed.)
- ISO/IEC 25010:2011 — Calidad del producto de software
- Pressman, R. S. (2014). *Ingeniería del Software* (7ª ed.)
- Tailwind CSS docs
- Vercel docs
- @react-pdf/renderer docs

---

## 22. Anexos
Indica qué incluir: capturas de pantalla del sistema en producción, EDT (Estructura de Desglose del Trabajo), código fuente relevante (middleware de roles, generación certificado), scripts SQL de migración BD.

---

## INSTRUCCIÓN FINAL

Ya tienes todos los datos del proyecto y la plantilla completa. Redacta ahora el informe final en un único bloque Markdown, cubriendo las 22 secciones sin omitir ninguna. Usa datos reales del proyecto en cada sección. Genera todos los diagramas Mermaid indicados. Usa `// COMPLETAR: [descripción]` solo donde genuinamente falta un dato que no está en este prompt (nombre de personas, fechas exactas, número de RUT institucional). No acortes secciones.
