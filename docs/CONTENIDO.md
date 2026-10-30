# Escribir contenido

Todo el contenido vive en `content/` y se valida al compilar ([`validators.ts`](../app/scripts/content/validators.ts)). Si algo no cumple estas reglas, `npm start` y `npm run build` fallan y explican qué falta.

## Estructura

```text
content/
  roadmap.json                    Fases y módulos
  <id-del-módulo>/
    module.json                   Descripción y lista ordenada de lecciones
    lessons/NN-<id>.md            Lección
    questions/NN-<id>.json        Preguntas de esa lección
```

- Un módulo que aparece en `roadmap.json` sin carpeta se muestra como «Próximamente».
- El `id` de `module.json` tiene que coincidir con el nombre de la carpeta.
- `lessons` en `module.json` lista los nombres de fichero sin extensión, en orden: `"01-java-hoy"`.

## Lección

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

| Regla | Detalle |
| --- | --- |
| Nombre de fichero | `NN-<id>.md`, con el mismo `id` que en el frontmatter (kebab-case) |
| `minutes` | Entero entre 5 y 10 |
| `sources` | Entre 1 y 3 URLs `https`, oficiales y libres |
| Secciones | Las cuatro, con esos títulos exactos |

Criterios de redacción, del [diseño](DISENO.md):
- **Por qué importa:** 2 o 3 frases con un problema real de negocio, a ser posible de HelpDesk IA.
- **Idea central:** la explicación, con un fragmento de código corto o una tabla como máximo.
- **Error típico:** cómo falla en la práctica, **incluido cómo lo suele fallar una IA**.
- **Fuentes:** las mismas URLs del frontmatter, con un texto descriptivo.
- **Tono:** español con «tú», frases cortas, sin relleno.

## Preguntas

Un array JSON con **al menos 3 preguntas**. Los `id` tienen que ser **únicos en todo el contenido**, porque son la clave del repaso: si cambias uno, se pierde el progreso de esa pregunta. Por convención: `<id-lección>-N`.

| Tipo | Campos | `answer` |
| --- | --- | --- |
| `quiz` | `options` (2 o más) | Índice de la opción correcta (desde 0) |
| `find-the-bug` | `code` (obligatorio) | Número de línea del fallo (desde 1) |
| `design-decision` | `options` (2 o más) | Índice de la opción recomendada; se autoevalúa |

Todos llevan `id`, `type`, `prompt` y `explanation`. `code` es opcional en `quiz` y `design-decision`.

Las opciones se **barajan** al mostrarlas, así que da igual en qué posición pongas la correcta. Aun así, no escribas siempre la correcta primero: cualquiera que lea el JSON aprendería el patrón.

## Antes de dar una lección por buena

1. **Verifica cada afirmación técnica** contra la fuente oficial y, si se puede, **ejecútala**: el Curso 0 se comprobó con JDK 25.
2. Comprueba que las URLs responden: `curl -s -o /dev/null -w '%{http_code}' <url>`.
3. Usa versiones comprobadas en npm o en Maven Central (`maven-metadata.xml`), nunca supuestas.
4. Valida con `npm run content` (en `app/`) y revisa la lección en el móvil: las tablas y el código largo deben desplazarse dentro de su bloque, no la página entera.
5. Nada de cursos de pago ni de vídeos como fuente: solo documentación oficial, especificaciones y repos abiertos.

## Añadir un módulo

1. Crea `content/<id>/module.json` con el mismo `id` que tiene en `roadmap.json`.
2. Añade las lecciones y sus preguntas.
3. Si tiene proyecto práctico, créalo en `proyectos/<id>-<nombre>/` con un README que haga de enunciado, tests en rojo y una solución de referencia **fuera del repo** que demuestre que los tests se pueden cumplir.
