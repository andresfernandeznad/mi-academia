# Mi Academia — instrucciones para Claude Code

Plataforma personal de aprendizaje (PWA) para un solo usuario: Andrés, desarrollador full stack Java + Angular (~7 años) que quiere un perfil de full stack con criterio de arquitecto que integra IA en productos de negocio. El diseño completo está en `docs/DISENO.md`; léelo antes de proponer cambios de alcance.

## Reglas del proyecto

- **Coste 0 €.** Nada que requiera pagar: sin API de IA en tiempo de ejecución, alojamiento en GitHub Pages, base de datos en el plan gratuito de Supabase.
- **El contenido se genera en sesiones de Claude, no en la app.** La app solo lee ficheros estáticos de `content/`.
- **Idioma:** contenido y UI en español; código, nombres de variables y commits en inglés.
- **Simple antes que completo.** Primero el MVP (abajo). No añadir funcionalidades fuera del MVP sin preguntar.
- **Cada lección cita fuentes oficiales y libres** (documentación oficial, RFC, repos open source). Nunca copiar contenido de cursos de pago ni de vídeos.
- Antes de usar una versión concreta de una librería, compruébala con `npm view` / Maven Central; no la supongas.

## Stack

- **App:** Angular (última versión estable), standalone components, signals, sin Zone.js si es viable, `@angular/pwa` para el service worker. Mobile first.
- **Progreso:** IndexedDB local (fuente de verdad offline) + sincronización automática con Supabase (auth con GitHub OAuth, tabla con Row Level Security). La clave `anon` de Supabase puede ir en el frontend; la seguridad la dan las políticas RLS.
- **Despliegue:** GitHub Actions compila y publica en GitHub Pages en cada push a `main` (cuidar `base-href`).
- **Keep-alive:** workflow programado de GitHub Actions que hace una petición a Supabase cada pocos días para que el plan gratuito no se pause.
- **Proyectos de práctica (Java):** Java 25, Maven, JUnit 5 + AssertJ. Más adelante, el repo aparte `helpdesk-ia` con Spring Boot + Angular.

## Estructura del repositorio

```
app/                      Angular PWA
content/
  roadmap.json            Fases y módulos (id, título, horas, orden)
  curso-0-java/
    module.json           Metadatos del módulo y lista de lecciones
    lessons/01-java-hoy.md
    questions/01-java-hoy.json
supabase/migrations/      SQL de tablas y políticas RLS
.github/workflows/        deploy.yml, keepalive.yml
docs/DISENO.md            Diseño aprobado
```

## Formato del contenido

Lección (`lessons/NN-slug.md`) con frontmatter:

```markdown
---
id: java-hoy
title: "Java hoy: JDK, JShell y Maven"
minutes: 8
sources:
  - https://dev.java/learn/
---
## Por qué importa
## Idea central
## Error típico
## Fuentes
```

Preguntas (`questions/NN-slug.json`): array de objetos con `id`, `type` (`quiz` | `find-the-bug` | `design-decision`), `prompt`, `code` (opcional), `options`, `answer`, `explanation`. Las de `design-decision` son de autoevaluación.

## MVP (lo único que se construye ahora)

1. Lista de módulos y lecciones a partir de `content/`.
2. Lector de lecciones en Markdown, cómodo en el móvil.
3. Tests al final de cada lección con corrección inmediata.
4. Repaso espaciado diario (algoritmo Leitner o SM-2 simplificado) con las preguntas ya vistas.
5. Progreso offline en IndexedDB + sincronización con Supabase tras login con GitHub.
6. Contenido completo del **Curso 0: Java esencial** (12 lecciones, 3+ preguntas cada una) y el enunciado del proyecto CLI con sus tests.
7. Despliegue en GitHub Pages instalable como PWA.

Criterio de éxito: Andrés la usa al menos 5 días por semana durante 3 semanas. Hasta entonces, no se genera más contenido.

## Forma de trabajar

- Planifica antes de programar y enseña el plan; trabaja en pasos pequeños con commits frecuentes.
- Explica brevemente las decisiones técnicas no obvias: Andrés también aprende del propio proyecto.
- Ejecuta build y tests antes de dar algo por terminado.
