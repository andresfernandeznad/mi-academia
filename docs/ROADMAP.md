# Roadmap del producto

Estado de la plataforma, qué viene después y la deuda técnica conocida. El temario de estudio está en [DISENO.md](DISENO.md); esto trata de la **app**.

Última actualización: 31 de octubre de 2026.

## Estado: MVP completo

| # | Paso | Estado |
| --- | --- | --- |
| 1 | Esqueleto Angular PWA | Hecho |
| 2 | Formato de contenido validado en el build | Hecho |
| 3 | Roadmap, módulos y lector de lecciones | Hecho |
| 4 | Despliegue en GitHub Pages | Hecho |
| 5 | Preguntas al final de cada lección | Hecho |
| 6 | Repaso espaciado (Leitner) | Hecho |
| 7 | Progreso offline en IndexedDB | Hecho |
| 8 | Login con GitHub y sincronización con Supabase | Hecho |
| 9 | Curso 0 completo y proyecto CLI | Hecho |

Además del plan original:
- **Rediseño visual con modo noche** y una auditoría de contraste, legibilidad y áreas táctiles.
- **Aviso de versión nueva.**
- **Keepalive de Supabase.**
- **Progreso por lección** (feature 2): lecciones completadas con ✓, barra por módulo y botón «Continuar» en el roadmap.
- **Identidad de la PWA** (feature 3): iconos y favicon propios.

## Criterio de éxito (en curso)

> Usar la plataforma al menos **5 días por semana durante 3 semanas seguidas**. Hasta entonces, no se genera más contenido.

Periodo de prueba: del **lunes 2 de noviembre** al **domingo 22 de noviembre de 2026**.

Hoy la app no mide esto por sí sola (ver la feature 1). Mientras tanto, la tabla `review_cards` de Supabase guarda `updated_at` por respuesta, así que los días con actividad se pueden consultar.

## Siguientes features

Ordenadas por prioridad. Cada una tiene un criterio de terminado verificable.

### Ahora: apoyan el criterio de éxito

1. **Registro de días de estudio y racha.**
   - **Qué:** marcar el día como estudiado al leer una lección o responder un repaso, y mostrar la racha y los días de esta semana en el roadmap.
   - **Hecho cuando:** la app muestra «4 de 5 días esta semana» y el dato se sincroniza entre dispositivos.
2. ~~**Progreso por lección.**~~ Hecho el 31 de octubre de 2026. Una lección cuenta como completada cuando todas sus preguntas tienen tarjeta de repaso.
3. ~~**Identidad de la PWA.**~~ Hecho: iconos y favicon con la mascota.

### Después del criterio de éxito (del diseño)

4. **Proyecto por módulo con tests en GitHub Actions.** El diseño dice que, cuando los tests de una rama pasan en Actions, el módulo se marca como superado.
   - **Qué:** consultar el estado de los workflows en la API pública de GitHub.
   - **Hecho cuando:** el Curso 0 aparece como «Superado» al poner en verde los tests de la CLI.
5. **Repo `helpdesk-ia`** (Spring Boot + Angular) como proyecto vivo a partir de la fase 1.
6. **Contenido de la fase 1:** HTTP, bases de datos, concurrencia y seguridad. El módulo 2.1 (Angular moderno) puede ir en paralelo.

### Mejoras a valorar

- **Resaltado de sintaxis en el build,** sin JavaScript extra en la app.
- **Estadísticas del repaso:** tarjetas por caja y preguntas que más fallas.
- **Búsqueda en las lecciones.**
- **Recordatorio diario de repaso.** Hay que investigar si se puede hacer gratis (Web Push necesita un servidor que envíe).

## Deuda técnica

| Tema | Impacto | Propuesta |
| --- | --- | --- |
| La sincronización usa los relojes de cada dispositivo («gana la última escritura»); se observaron unos 30 s de desfase | Un conflicto entre dos dispositivos con segundos de diferencia puede resolverse mal | Asignar `updated_at` en el servidor con un trigger y un contador de versión |
| Los proyectos Java no se compilan en CI | Un cambio en un test o una firma podría romper el enunciado sin que nadie lo note | Workflow que haga `mvn test-compile` del esqueleto |
| Los fragmentos de código de las lecciones 02 a 11 usan nombres en español; la regla dice código en inglés | Inconsistencia con el proyecto CLI (en inglés) | Decidir la convención y, si toca, pasarlos al inglés |
| Sin tests end-to-end | Login, offline y aviso de versión solo se han verificado a mano | Playwright con un par de flujos críticos |
| Maven 3.8.6 en local | Avisos con JDK 25 | Actualizar a Maven 3.9 |

## Cómo iterar

1. **Elige** una feature de esta lista y pide un plan antes de programar.
2. **Escribe primero los tests** (TDD estricto) y después la implementación.
3. **Verifica:** `npm run test:all`, `npm run build` y una revisión en el móvil, en claro y en noche.
4. **Publica:** commit con conventional commits y push a `main`. El deploy publica solo si pasan los tests.
5. **Cierra:** actualiza este documento. Marca lo hecho, añade lo que hayas descubierto y ajusta las prioridades.

Para retomar con Claude Code: «Lee `docs/ROADMAP.md` y `docs/ARQUITECTURA.md` y propón el plan para la feature N».
