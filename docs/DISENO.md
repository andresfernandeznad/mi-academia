# Plataforma de aprendizaje personal — Diseño del primer roadmap

Versión del 30 de octubre de 2026. Documento original: https://claude.ai/artifact/DtpzLxscy2LRTSA3TAdpog

## Objetivo y perfil destino

El roadmap 1 te lleva de full stack Java + Angular a **full stack con criterio de arquitecto que integra IA en productos de negocio**. No se trata de cambiar de stack, sino de añadir encima tres capas que la IA no sustituye con facilidad.

| Capa | Qué significa en la práctica | Por qué es difícil de reemplazar |
| --- | --- | --- |
| Fundamentos | HTTP, bases de datos, concurrencia, seguridad, patrones | Sin ellos no puedes juzgar si el código generado por una IA es correcto |
| Diseño de sistemas | Elegir arquitectura, modelar el dominio, gestionar compromisos | Es criterio y contexto de negocio, no generación de código |
| Ingeniería de producto con IA | LLMs dentro del backend: salida estructurada, RAG, herramientas, evaluación | Es la competencia que más crece y la menos cubierta por perfiles clásicos |
| Full stack actual | Angular moderno + Java moderno + calidad (tests, observabilidad) | Es tu base y tu ventaja: no empiezas de cero |

La decisión clave es **quedarte en Java para la parte de IA** en lugar de cambiar a Python. Spring AI y LangChain4j ya cubren salida estructurada, RAG, tool calling y MCP. HelpDesk IA usará Spring Boot, así que Spring AI será el framework principal de la fase 4 y LangChain4j queda como comparación.

## Principios

1. **Toda lección cita su fuente oficial.** Documentación, especificaciones o repos abiertos. Si una afirmación no tiene fuente, no entra.
2. **Solo fuentes libres.** Documentación oficial, artículos abiertos y repos open source. Los cursos de pago y vídeos sirven solo para decidir qué temas importan, nunca como contenido.
3. **Móvil para entender y repasar, ordenador para construir.** Cada módulo tiene ambas partes; ninguno se da por superado solo con la del móvil.
4. **Un proyecto vivo atraviesa todo el roadmap.** Cada módulo añade algo a la misma aplicación de negocio, en lugar de ejercicios sueltos.
5. **Un solo roadmap hasta que se demuestre útil.** Criterio de éxito: estudiar al menos 5 días por semana durante 3 semanas seguidas.
6. **El contenido es código.** Se escribe en ficheros versionados en Git; corregir un error es un commit, no una base de datos.

## Temario del roadmap 1

Son un curso 0 de Java y 4 fases con 12 módulos, unas 235 horas estimadas: a 6–8 horas por semana, entre 7 y 9 meses. El proyecto vivo es **HelpDesk IA**, una aplicación de tickets de soporte para una empresa. Cada módulo le añade una pieza.

| Fase | Módulo | Qué aprendes | Qué añade a HelpDesk IA | Horas aprox. | Fuente principal |
| --- | --- | --- | --- | --- | --- |
| 0. Arranque | 0.1 Java esencial (curso rápido) | Java moderno de base a extendido: ver sección siguiente | CLI que importa tickets desde CSV | 15 | [dev.java](https://dev.java/learn/) |
| 1. Fundamentos | 1.1 HTTP y APIs a fondo | Métodos, códigos, caché, idempotencia, REST bien hecho | API de tickets en Spring Boot con contrato OpenAPI | 15 | [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) |
| 1. Fundamentos | 1.2 Bases de datos | Modelado, índices, transacciones, niveles de aislamiento | Esquema PostgreSQL y migraciones | 20 | [PostgreSQL docs](https://www.postgresql.org/docs/current/) |
| 1. Fundamentos | 1.3 Concurrencia y JVM | Hilos, virtual threads, java.util.concurrent, memoria y GC | Servicio de asignación concurrente | 15 | [dev.java](https://dev.java/learn/) |
| 1. Fundamentos | 1.4 Seguridad web | OWASP Top 10, Spring Security, OAuth2/OIDC | Login y roles | 15 | [OWASP Top 10](https://owasp.org/www-project-top-ten/) |
| 2. Full stack actual | 2.1 Angular moderno | Signals, standalone, change detection sin Zone.js | Frontend de tickets | 15 | [angular.dev](https://angular.dev) |
| 2. Full stack actual | 2.2 Tests de verdad | Pirámide de tests, Testcontainers, tests de contrato | Suite que corre en CI | 20 | [Testcontainers](https://testcontainers.com/guides/) |
| 2. Full stack actual | 2.3 Observabilidad y despliegue | Logs, métricas, trazas, Docker, CI/CD | App en contenedores y pipeline | 15 | [OpenTelemetry](https://opentelemetry.io/docs/) |
| 3. Diseño de sistemas | 3.1 Arquitectura y dominio | Capas, hexagonal, DDD táctico, cuándo no usar microservicios | Refactor a arquitectura hexagonal | 20 | [System Design Primer](https://github.com/donnemartin/system-design-primer) |
| 3. Diseño de sistemas | 3.2 Escalabilidad y mensajería | Colas, eventos, consistencia eventual, cachés | Notificaciones por eventos | 20 | [System Design Primer](https://github.com/donnemartin/system-design-primer) |
| 4. Producto con IA | 4.1 LLMs para ingenieros | Tokens, contexto, prompts, salida estructurada, coste | Clasificación automática de tickets | 20 | [Spring AI docs](https://docs.spring.io/spring-ai/reference/) |
| 4. Producto con IA | 4.2 RAG y herramientas | Embeddings, búsqueda vectorial, tool calling, MCP | Asistente que responde con la base de conocimiento | 25 | [Spring AI docs](https://docs.spring.io/spring-ai/reference/) |
| 4. Producto con IA | 4.3 Evaluación y producción | Evals, guardrails, observabilidad de LLMs, revisar código generado por IA | Suite de evals y panel de calidad | 20 | [Spring AI docs](https://docs.spring.io/spring-ai/reference/) |

Las horas son una estimación, para ajustar tras el primer módulo. El orden por fases es orientativo: 2.1 puede ir en paralelo a la fase 1.

## Curso 0: Java esencial

Repaso rápido de 12 lecciones y unas 15 horas que va de lo que ya usas a lo que Java añadió en las últimas versiones, tomando como referencia Java 25 (LTS). Es el primer módulo que se construye y sirve de prueba para la plataforma.

1. **Java hoy:** JDK, JShell, Maven y estructura de un proyecto
2. **Tipos y texto:** primitivos vs objetos, var, String, text blocks
3. **POO bien hecha:** interfaces, composición frente a herencia, equals y hashCode
4. **Records e inmutabilidad:** cuándo usar un record y cuándo una clase
5. **Enums, sealed y pattern matching:** modelar estados con switch moderno
6. **Genéricos sin miedo:** comodines y la regla PECS
7. **Colecciones:** List, Set, Map, cuál elegir y su coste
8. **Lambdas y Optional:** interfaces funcionales y referencias a métodos
9. **Streams:** map, filter, collect y groupingBy en casos reales
10. **Excepciones:** checked frente a unchecked, try-with-resources
11. **Fechas:** java.time y zonas horarias sin sustos
12. **Tests:** JUnit 5 y AssertJ, base para todo el roadmap

Proyecto de cierre: una CLI que lee un CSV de tickets, los valida y saca estadísticas por estado y prioridad. Se corrige con tests.

## Formato de una lección

Cada lección dura entre 5 y 10 minutos, se lee cómoda en el móvil y termina con 3 preguntas. Un módulo tiene entre 8 y 15 lecciones y un proyecto de ordenador.

1. **Por qué importa** (2–3 frases): un problema real de negocio que este concepto resuelve.
2. **Idea central**: la explicación, con un diagrama o un fragmento de código corto como máximo.
3. **Error típico**: cómo suele fallar en la práctica, incluido cómo lo suele fallar una IA que genera código.
4. **Comprueba**: 3 preguntas que alimentan el repaso espaciado.
5. **Fuentes**: 1–3 enlaces a la documentación oficial donde verificar lo leído.

## Formato de ejercicios

| Tipo | Dónde | Duración | Corrección | Ejemplo |
| --- | --- | --- | --- | --- |
| Test conceptual | Móvil | 1 min | Automática | ¿Qué método HTTP no es idempotente por defecto? |
| Encuentra el fallo | Móvil | 3 min | Automática (eliges la línea) | Un endpoint Java generado por IA con una inyección SQL |
| Decisión de diseño | Móvil | 5 min | Autoevaluación con respuesta razonada | ¿Cola o llamada síncrona para enviar notificaciones? |
| Repaso espaciado | Móvil | 5 min al día | Autoevaluación (fácil / dudoso / fallado) | Las preguntas de lecciones anteriores vuelven según tus fallos |
| Proyecto HelpDesk IA | Ordenador | 3–6 h por módulo | Tests automáticos en GitHub Actions | Implementar Idempotency-Key en POST /tickets |

El proyecto de cada módulo se entrega como una rama con tests que fallan. El trabajo es dejarlos en verde. Cuando GitHub Actions pasa, la plataforma marca el módulo como superado.

## Arquitectura técnica a 0 €

```
Claude (genera contenido) --> Repo de contenido (Markdown + JSON) --> GitHub Actions (build PWA) --> GitHub Pages
                                                                                                        |
                                                                                                        v
Repo HelpDesk IA (tests que fallan) --> GitHub Actions (ejecuta tests) --> PWA en móvil y PC <--> Supabase (progreso)
        ^                                                                       |
        +------------------------- haces push con tu solución ------------------+
```

- **Frontend:** Angular como PWA instalable. Funciona sin conexión.
- **Contenido:** lecciones en Markdown y preguntas en JSON, en el mismo repositorio que la web.
- **Progreso:** primero en el navegador (IndexedDB) para funcionar sin conexión; se sincroniza solo con Supabase (Postgres gratuito, login con GitHub) al recuperar conexión. El plan gratuito pausa el proyecto tras 7 días sin uso; un workflow programado de GitHub Actions lo evita.
- **Proyecto HelpDesk IA:** repositorio aparte en Spring Boot + Angular; la PWA consulta el estado de sus tests en la API pública de GitHub.
- **IA dentro de HelpDesk (fase 4):** con un modelo local gratuito (por ejemplo, Ollama) para no pagar API.
