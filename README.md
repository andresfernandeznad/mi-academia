# Mi Academia

Plataforma personal de aprendizaje: una PWA para estudiar en el móvil y practicar en el ordenador. Sigue un roadmap para pasar de full stack Java + Angular a full stack con criterio de arquitecto que integra IA en productos de negocio.

**En producción:** <https://andresfernandeznad.github.io/mi-academia/>

## Qué hace

- **Roadmap** con 5 fases y 13 módulos. El Curso 0, *Java esencial*, está completo: 12 lecciones y 36 preguntas.
- **Lector de lecciones** pensado para el móvil, con modo claro, noche o según el sistema.
- **Preguntas al final de cada lección**, con corrección inmediata: test, encuentra el fallo y decisión de diseño.
- **Repaso espaciado diario** con el sistema Leitner: las preguntas vuelven según cómo te fueron.
- **Funciona sin conexión.** El progreso se guarda en el dispositivo (IndexedDB) y se sincroniza entre dispositivos al entrar con GitHub (Supabase).
- **Aviso de versión nueva** cuando se publica un cambio.
- **Proyecto práctico por módulo:** el del Curso 0 es una CLI de tickets con tests que hay que poner en verde ([`proyectos/curso-0-tickets-cli`](proyectos/curso-0-tickets-cli/README.md)).

Coste: 0 €. GitHub Pages, plan gratuito de Supabase y ninguna API de IA en ejecución. El contenido se escribe en sesiones de Claude y se versiona en `content/`.

## Arrancar en local

Requisitos: **Node ≥ 24.15** (`.nvmrc` fija la 24.22.2). Para el proyecto Java: **JDK 25** y Maven.

```bash
cd app
npm ci
npm start
```

Abre <http://localhost:4200>. `npm start` y `npm run build` compilan antes el contenido de `content/`: si una lección no cumple el formato, el arranque falla y te dice qué fichero y por qué.

| Comando (en `app/`) | Qué hace |
| --- | --- |
| `npm start` | Servidor de desarrollo (sin service worker) |
| `npm run build` | Build de producción en `dist/` |
| `npm run test:all` | Tests del pipeline de contenido (node:test) y de la app (Vitest) |
| `npm run content` | Solo valida y compila `content/` |
| `npm run typecheck:scripts` | Comprueba tipos de los scripts de Node |

## Estructura

```text
app/                       PWA en Angular 22 (zoneless, standalone, signals)
  scripts/                 Pipeline de contenido: valida content/ y lo compila a JSON
  src/app/
    content/               Modelo y carga del contenido compilado
    features/              Páginas: roadmap, módulo, lección, repaso, cuenta
    quiz/                  Preguntas y corrección
    review/                Repaso Leitner y persistencia (IndexedDB)
    sync/                  Login con GitHub y sincronización con Supabase
    theme/ update/         Modo noche y aviso de versión nueva
content/                   Roadmap, módulos, lecciones (Markdown) y preguntas (JSON)
proyectos/                 Proyectos de práctica en Java, con tests
supabase/migrations/       Esquema y políticas RLS
.github/workflows/         deploy.yml (Pages) y keepalive.yml (Supabase)
docs/                      Diseño, arquitectura, contenido, roadmap y Supabase
```

## Documentación

| Documento | Para qué |
| --- | --- |
| [docs/DISENO.md](docs/DISENO.md) | El diseño aprobado: objetivo, temario completo y principios |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Cómo está construida la app y por qué |
| [docs/CONTENIDO.md](docs/CONTENIDO.md) | Cómo escribir lecciones, preguntas y módulos nuevos |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Estado, siguientes features y deuda técnica |
| [docs/SUPABASE.md](docs/SUPABASE.md) | Puesta en marcha de la sincronización |
| [CLAUDE.md](CLAUDE.md) | Reglas para trabajar en el repo con Claude Code |

## Despliegue

Cada push a `main` ejecuta [`deploy.yml`](.github/workflows/deploy.yml): instala dependencias, pasa todos los tests, compila con el `base-href` del repositorio y publica en GitHub Pages. Si falla un test, no se publica.
