# Arquitectura

Cómo está construida Mi Academia y por qué. El diseño de producto está en [DISENO.md](DISENO.md).

## Vista general

```text
content/ (Markdown + JSON)
   │  app/scripts/build-content.ts: valida y compila
   ▼
app/generated/content/*.json  ──►  ng build  ──►  GitHub Pages (PWA)
                                                     │
                       ┌─────────────────────────────┴───────────────┐
                       ▼                                              ▼
            Service worker (caché offline)           IndexedDB (progreso, fuente de verdad)
                                                                      │  SyncService (PKCE + RLS)
                                                                      ▼
                                              Supabase: tablas review_cards y study_days
```

La app no tiene backend propio: todo es estático salvo la copia del progreso en Supabase.

## Pipeline de contenido

- `content/` es la fuente: `roadmap.json`, y por módulo un `module.json`, `lessons/NN-slug.md` y `questions/NN-slug.json`. El formato está en [CONTENIDO.md](CONTENIDO.md).
- `app/scripts/build-content.ts` corre antes de `start` y `build`. Valida todo y, si hay errores, los lista **todos**, cada uno con su fichero, y corta el build. Si no hay errores, genera:
  - `index.json`: el roadmap con el resumen de cada módulo;
  - `<módulo>/<lección>.json`: el HTML de la lección y sus preguntas;
  - `questions.json`: todas las preguntas con su origen, para el repaso.
- El Markdown se convierte a HTML **en el build** con `marked`: la app no carga ningún parser.
- Los scripts son TypeScript que Node 24 ejecuta directamente (type stripping), con tests en `node:test`. El modelo de datos compartido está en [`content.model.ts`](../app/src/app/content/content.model.ts).

## La app

Angular 22: componentes standalone, signals, sin Zone.js y `OnPush`. Cada página se carga de forma diferida.

| Carpeta | Responsabilidad |
| --- | --- |
| `content/` | `ContentService`: carga el JSON compilado con `httpResource`, con URLs relativas al `base href` |
| `features/` | Páginas (contenedores): roadmap, módulo, lección, repaso (`/repaso`) y cuenta (`/cuenta`) |
| `quiz/` | Corrección pura (`grading.ts`), tarjeta de pregunta y bloque de preguntas de la lección (presentacionales) |
| `progress/` | Progreso por lección derivado de las tarjetas (`progress.ts`, puro) y `ProgressService` |
| `study-days/` | Racha y semana puras (`study-days.ts`), `StudyDaysService` y el puerto `StudyDaysRepository` con sus adaptadores |
| `storage/` | Apertura de la base IndexedDB compartida y sus versiones |
| `review/` | Leitner puro (`leitner.ts`), `ReviewService` y el puerto `ReviewRepository` con sus adaptadores (IndexedDB y memoria) |
| `sync/` | Merge puro (`merge.ts`), `SyncService`, `AuthService` y el puerto `RemoteReviewStore` con su adaptador Supabase |
| `theme/` | Tema sistema, claro o noche, guardado por dispositivo y aplicado antes del primer pintado |
| `update/` | Aviso de versión nueva a partir de `SwUpdate` |

### Puertos y adaptadores

La lógica de negocio (Leitner, merge, corrección) son **funciones puras sin Angular**. La persistencia entra por puertos, que son clases abstractas y a la vez tokens de inyección:

- `ReviewRepository` → `IndexedDbReviewRepository` en el navegador, y `InMemoryReviewRepository` en los tests y en jsdom.
- `RemoteReviewStore` → `SupabaseReviewStore`.

Así se cambia el almacenamiento sin tocar la lógica, y los tests no dependen de IndexedDB ni de la red.

### Repaso espaciado

- 5 cajas que se repasan cada 1, 2, 4, 8 y 16 días. «Fácil» sube una caja, «Dudoso» la mantiene y «Fallado» vuelve a la caja 1.
- Solo la **primera** respuesta en una lección crea la tarjeta. Releer una lección no mueve nada.
- En el repaso, una respuesta autocorregida incorrecta solo se puede marcar como «Fallado».
- Las fechas son días de calendario locales (`"YYYY-MM-DD"`); la aritmética se hace en UTC para que el cambio de hora no afecte.

### Progreso por lección

- **No se guarda, se deriva.** Una lección está completada cuando todas sus preguntas tienen tarjeta de repaso, porque la primera respuesta en la lección es la que crea la tarjeta.
- El build añade `questionIds` a cada lección de `index.json`, así que el roadmap calcula el progreso sin cargar `questions.json`.
- «Continuar» lleva a la primera lección no completada, en el orden del roadmap.
- No hay tabla ni sincronización nuevas: el progreso viaja con `review_cards`.

### Días de estudio

- Un día cuenta como estudiado cuando respondes una pregunta, en una lección (aunque ya la hubieras respondido) o en el repaso. Abrir una lección no cuenta: no hay forma de saber si la leíste.
- Son un **conjunto de fechas que solo crece**. Para unir dos dispositivos basta con juntar ambos conjuntos: no hace falta `updated_at` y no hay conflictos posibles.
- La racha no se rompe hasta que acaba el día: si estudiaste ayer y hoy todavía no, sigue viva. La semana va de lunes a domingo.
- La primera vez, el servicio recupera días a partir del `updatedAt` de las tarjetas. Es una recuperación parcial, porque cada repaso pisa la fecha anterior.
- IndexedDB está en la **versión 2**. `onupgradeneeded` solo crea los almacenes que faltan, así que subir de versión no borra los datos. Un test abre una base v1 real y comprueba que las tarjetas siguen ahí.

### Sincronización

- IndexedDB es la fuente de verdad offline; Supabase es la copia compartida.
- Cada cambio local lleva `updatedAt`. El merge es **por tarjeta y gana la versión más reciente**. Una tarjeta sin fecha (anterior a la sincronización) pierde siempre.
- Se sincroniza al entrar, 2 s después de cada cambio, al recuperar la conexión y al volver a la app. Solo hay una sincronización en marcha a la vez, más una en cola como máximo.
- Login con GitHub mediante **PKCE**: el token nunca aparece en la URL.
- `supabase-js` se carga de forma diferida (unos 49 KB comprimidos) y solo si hay configuración.
- La clave publicable va en el frontend; lo que protege los datos son las políticas **RLS** de [la migración](../supabase/migrations/20261030000000_review_cards.sql).

### PWA y offline

- `ngsw-config.json` precachea la app y **todo el contenido**: tras la primera visita, las lecciones se leen sin red.
- Al publicar, el service worker sirve primero la versión en caché y descarga la nueva; `UpdateService` muestra «Hay una versión nueva» con un botón para recargar.
- GitHub Pages no tiene fallback para SPA: el deploy copia `index.html` a `404.html` para que los enlaces directos funcionen.

## Diseño visual

Es un «papel técnico de ingeniero»:
- **Estructura:** fondo de rejilla, una hoja por página con marcas de esquina y esquinas rectas en todo.
- **Color:** un único acento naranja.
- **Tipografía, con un trabajo por familia** (alojadas en la app con `@fontsource-variable`):
  - Pixelify Sans: logo y títulos;
  - IBM Plex Sans: lectura;
  - JetBrains Mono: código y metadatos.

Los tokens y los estilos compartidos (`.sheet`, `.rows`, `.button`, `.prose`) están en [`styles.scss`](../app/src/styles.scss). El modo noche es un mixin con grises neutros, sin negro ni blanco puros.

Valores medidos en la auditoría de diseño:
- **Contraste:** todo el texto pasa 4.5:1 en los dos temas.
- **Foco:** el anillo usa `--accent-ink`, porque el naranja puro solo daba 2.6:1 sobre la hoja clara.
- **Longitud de línea:** unos 66 caracteres (`--measure: 31rem`, no en `ch`).
- **Áreas táctiles:** 44 px.

## Decisiones

| Decisión | Por qué | Alternativa descartada |
| --- | --- | --- |
| Contenido compilado en el build | Un error de formato rompe el build y no llega al móvil | Parsear Markdown en el navegador |
| Leitner de 5 cajas | Encaja con fácil, dudoso o fallado; es simple y fácil de razonar | SM-2 (más complejo para pocas preguntas) |
| Opciones barajadas al mostrar | El contenido tendía a poner la respuesta correcta en primer lugar | Confiar en el orden del JSON |
| Puertos para la persistencia | IndexedDB y Supabase cambian sin tocar la lógica, y los tests son rápidos | Llamar a IndexedDB desde los servicios |
| Progreso derivado de las tarjetas de repaso | Una sola fuente de verdad: sincroniza gratis y nunca contradice al repaso | Tabla `lesson_progress` con un botón «Marcar como terminada» |
| Días de estudio como conjunto que solo crece | La unión no tiene conflictos ni depende de los relojes | Deducirlos de `review_cards.updated_at`, que pierde días |
| Gana la última escritura, por tarjeta | Suficiente para una persona en pocos dispositivos | Marcas temporales del servidor o CRDT |
| PKCE en vez del flujo implícito | El token no queda en la URL ni en el historial | El valor por defecto de supabase-js |
| Fuentes alojadas en la app | Funcionan offline, sin CDN | Google Fonts |
| JUnit 6 en los proyectos Java | Es la versión actual y mantiene el mismo API que JUnit 5 | JUnit 5 (solo mantenimiento) |

## Tests

- **Contenido:** `node:test` sobre el validador y el compilador, con ficheros temporales.
- **App:** Vitest con jsdom. Las páginas se prueban con `RouterTestingHarness` y `HttpTestingController`. Ojo: si `ContentService` deja una petición pendiente, `whenStable()` no resuelve, así que hay que responder también `index.json`.
- **Proyectos Java:** JUnit 6 + AssertJ; se entregan con los tests en rojo.
- **CI:** `deploy.yml` ejecuta `npm run test:all`. Los proyectos Java no se ejecutan en CI, porque fallan a propósito.

## Entorno local: trampas conocidas

- **Node:** Angular 22 necesita Node ≥ 24.15. Con nvm-windows, instala la versión de `.nvmrc`.
- **Git Bash:** convierte `--base-href /mi-academia/` en una ruta de Windows. Usa `MSYS_NO_PATHCONV=1` si compilas a mano con base href.
- **Maven:** usa `JAVA_HOME`, no el `java` del `PATH`. Si `mvn -version` no dice Java 25, la compilación falla con `release version 25 not supported`.
- **Consola de Windows:** usa `Cp1252`. Para ver bien la salida de la CLI: `java -Dstdout.encoding=UTF-8 ...`.
- **Service worker:** está desactivado en `npm start`. Para probarlo, compila y sirve `dist/` bajo `/mi-academia/`.
- **Diagnóstico del service worker:** `<base>/ngsw/state` muestra versiones, clientes y la última comprobación.
