# app/portal/capacitacion/[id]/

Página principal de una capacitación para el colaborador. Flujo secuencial en 3 pasos:

1. **Material** — visualización de archivos adjuntos (PDF, video, presentación, imagen) o embeds de YouTube/Drive
2. **Quiz** — evaluación con múltiples intentos (si está configurado). Muestra resultado al finalizar
3. **Certificado** — generado automáticamente al aprobar el quiz. Permite descarga en PDF

El estado de la asignación se actualiza automáticamente: PENDIENTE → EN PROGRESO → COMPLETADO.
