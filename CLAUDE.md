# Mi Academia — instrucciones para Claude Code

Plataforma personal de aprendizaje (PWA) para un solo usuario: Andrés, desarrollador full stack Java + Angular (~7 años) que quiere un perfil de full stack con criterio de arquitecto que integra IA en productos de negocio.

Antes de proponer cambios, lee:
- `docs/DISENO.md`: el diseño aprobado y el temario;
- `docs/ROADMAP.md`: el estado, las siguientes features y la deuda técnica;
- `docs/ARQUITECTURA.md`: cómo está construida la app y por qué.

## Reglas del proyecto

- **Coste 0 €.** Nada que requiera pagar: sin API de IA en tiempo de ejecución, alojamiento en GitHub Pages, base de datos en el plan gratuito de Supabase.
- **El contenido se genera en sesiones de Claude, no en la app.** La app solo lee ficheros estáticos de `content/`.
- **Idioma:** contenido y UI en español; código, nombres de variables y commits en inglés.
- **Simple antes que completo.** El MVP está terminado. Las nuevas features salen de `docs/ROADMAP.md`; no amplíes el alcance sin preguntar.
- **Cada lección cita fuentes oficiales y libres** (documentación oficial, RFC, repos open source). Nunca copiar contenido de cursos de pago ni de vídeos.
- Antes de usar una versión concreta de una librería, compruébala con `npm view` o en Maven Central (`maven-metadata.xml` del repositorio, no el buscador); no la supongas.

## Stack

- **App:** Angular 22 (standalone, signals, sin Zone.js, `OnPush`), `@angular/pwa`, Vitest. Mobile first. Fuentes alojadas en la app con `@fontsource-variable`.
- **Contenido:** compilado en el build por `app/scripts/build-content.ts` (Node 24 con type stripping, `node:test`, `yaml`, `marked`).
- **Progreso:** IndexedDB local (fuente de verdad offline) + sincronización automática con Supabase (login con GitHub mediante PKCE, tabla `review_cards` con Row Level Security). La clave publicable de Supabase va en el frontend; la seguridad la dan las políticas RLS.
- **Despliegue:** GitHub Actions ejecuta los tests, compila con el `base-href` del repositorio y publica en GitHub Pages en cada push a `main`.
- **Keep-alive:** `keepalive.yml` consulta Supabase cada 3 días para que el plan gratuito no se pause (secretos `SUPABASE_URL` y `SUPABASE_ANON_KEY`).
- **Proyectos de práctica (Java):** Java 25, Maven, JUnit 6 (Jupiter, mismo API que JUnit 5) + AssertJ. Más adelante, el repo aparte `helpdesk-ia` con Spring Boot + Angular.

## Estructura del repositorio

```
app/                      Angular PWA
  scripts/                Pipeline de contenido (validación + compilación a JSON)
  src/app/                content, features, quiz, review, sync, theme, update
content/                  roadmap.json y un directorio por módulo (module.json, lessons/, questions/)
proyectos/                Proyectos de práctica en Java, con tests en rojo
supabase/migrations/      SQL de tablas y políticas RLS
.github/workflows/        deploy.yml, keepalive.yml
docs/                     DISENO, ARQUITECTURA, CONTENIDO, ROADMAP, SUPABASE
```

## Formato del contenido

Las reglas completas están en `docs/CONTENIDO.md`, y el validador las aplica en el build. En resumen:

- **Lección** `lessons/NN-<id>.md`: frontmatter con `id`, `title`, `minutes` (5–10) y `sources` (1–3 URLs https), y las secciones `## Por qué importa`, `## Idea central`, `## Error típico` y `## Fuentes`.
- **Preguntas** `questions/NN-<id>.json`: 3 o más, cada una con `id` único en todo el contenido, `type` (`quiz` | `find-the-bug` | `design-decision`), `prompt`, `code` (opcional, obligatorio en `find-the-bug`), `options`, `answer` y `explanation`.
  - En `quiz` y `design-decision`, `answer` es el índice de la opción.
  - En `find-the-bug`, `answer` es la línea del fallo, contando desde 1.
  - Las de `design-decision` son de autoevaluación.

## Estado

MVP completo y publicado en <https://andresfernandeznad.github.io/mi-academia/>.

Criterio de éxito: Andrés la usa al menos 5 días por semana durante 3 semanas (del 2 al 22 de noviembre de 2026). Hasta entonces, no se genera más contenido.

## Comandos (en `app/`)

- `npm start`: servidor de desarrollo (compila el contenido antes).
- `npm run test:all`: tests del contenido y de la app.
- `npm run build`: build de producción.

## Entorno local

- **Node:** ≥ 24.15 (`.nvmrc`: 24.22.2). Con nvm-windows, si el Node del sistema es más antiguo, antepón `$NVM_HOME/v24.22.2` al `PATH` en cada comando.
- **Maven:** usa `JAVA_HOME`; para los proyectos Java tiene que apuntar al JDK 25.
- **Git Bash:** convierte rutas como `/mi-academia/`; usa `MSYS_NO_PATHCONV=1` al compilar a mano con `--base-href`.

## Forma de trabajar

- Planifica antes de programar y enseña el plan; trabaja en pasos pequeños con commits frecuentes.
- TDD estricto: el test primero, verlo fallar y después la implementación.
- Explica brevemente las decisiones técnicas no obvias: Andrés también aprende del propio proyecto.
- Ejecuta build y tests antes de dar algo por terminado, y revisa los cambios visuales en el móvil, en claro y en noche.
- Al terminar una feature, actualiza `docs/ROADMAP.md` (y `docs/ARQUITECTURA.md` si cambia una decisión).
