# Proyecto del Curso 0: importador de tickets por línea de comandos

Primera pieza de **HelpDesk IA**: una CLI que lee un CSV de tickets, los valida y saca estadísticas por estado y prioridad. Usa casi todo el Curso 0: records, enums, colecciones, streams, excepciones, fechas y tests.

**Cómo se corrige:** los tests de `src/test/java` ya están escritos y ahora fallan. El trabajo es ponerlos en verde sin tocarlos.

## Requisitos

- **JDK 25** y **Maven 3.8.6 o superior** (probado con 3.8.6). Comprueba que Maven usa el JDK 25: `mvn -version` debe decir `Java version: 25`. Si dice otra, apunta `JAVA_HOME` al JDK 25 (es el «error típico» de la lección 1).

```bash
mvn test
```

## El formato

```text
id;prioridad;estado;creado
T-101;ALTA;ABIERTO;2026-10-26
T-102;media;en_curso;2026-10-27
```

| Columna | Valores |
| --- | --- |
| `id` | Texto no vacío; se ignoran los espacios alrededor |
| `prioridad` | `ALTA`, `MEDIA` o `BAJA`, sin distinguir mayúsculas ni espacios |
| `estado` | `ABIERTO`, `EN_CURSO` o `CERRADO`, igual que la prioridad |
| `creado` | Fecha ISO `AAAA-MM-DD` |

## Reglas del importador

1. Si la primera línea es la cabecera `id;prioridad;estado;creado`, se salta. Si no, es un dato más.
2. Las líneas en blanco se ignoran, pero **cuentan** para numerar las líneas.
3. Una línea inválida **no detiene** la importación: se convierte en un error con su número, como `Línea 6: prioridad desconocida «URGENTISIMA»`. Motivos de error:
   - no tiene exactamente 4 columnas;
   - el id está vacío;
   - la prioridad o el estado son desconocidos (el mensaje incluye el valor);
   - la fecha no es ISO (el mensaje incluye el valor);
   - el id ya apareció antes: se conserva el primero.
4. `ImportResult` devuelve listas que nadie puede modificar después.

## Estadísticas e informe

- `TicketStats.countByStatus`: tickets por estado, con **todos** los estados en el orden del enum (incluidos los que tienen 0).
- `TicketStats.countOpenByPriority`: tickets **no cerrados** por prioridad, con el mismo criterio.
- `Report.render`: el texto exacto está en `ReportTest`.

## Orden sugerido

| Paso | Clase | Lecciones |
| --- | --- | --- |
| 1 | `Priority.parse`, `Status.parse` | 2, 5 |
| 2 | Validación en `Ticket` e inmutabilidad de `ImportResult` | 4 |
| 3 | `TicketImporter` | 7, 10, 11 |
| 4 | `TicketStats` | 7, 9 |
| 5 | `Report` | 2 |

Ejecuta solo una clase de tests mientras avanzas: `mvn test -Dtest=PriorityTest`.

## Probarlo con el CSV de ejemplo

```bash
mvn -q compile
java -Dstdout.encoding=UTF-8 -cp target/classes dev.miacademia.tickets.Main tickets.csv
```

`-Dstdout.encoding=UTF-8`: desde Java 18 los ficheros se leen en UTF-8, pero `System.out` usa la codificación de la consola, que en Windows suele ser `Cp1252` y estropea las tildes y las comillas «».

`tickets.csv` tiene a propósito una línea en blanco, un id repetido y tres líneas inválidas. La salida esperada empieza así:

```text
Tickets importados: 4
Errores: 4
  - Línea 6: prioridad desconocida «URGENTISIMA»
```

## Antes de pedir ayuda a una IA

Escribe tú la primera versión. Si después le pides a una IA que la revise, comprueba sus cambios contra los tests y contra las lecciones: `default` en un `switch` sobre un enum, `==` entre `String`, `catch` vacíos y `YYYY` en fechas son sus errores habituales.
