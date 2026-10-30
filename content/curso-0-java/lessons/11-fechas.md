---
id: fechas
title: "Fechas: java.time y zonas horarias sin sustos"
minutes: 9
sources:
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/package-summary.html
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatter.html
  - https://dev.java/learn/date-time/
---
## Por qué importa

El acuerdo de servicio dice «responder en 24 horas». Un ticket creado el sábado a las 10:00 en Madrid vence el domingo a las 09:00, no a las 10:00: esa noche se atrasó el reloj. Si el código no sabe de zonas horarias, el aviso de vencimiento llega una hora tarde.

## Idea central

`java.time` separa conceptos que antes se mezclaban:

| Tipo | Representa | Ejemplo |
| --- | --- | --- |
| `Instant` | Un instante exacto en UTC | Cuándo se creó un ticket |
| `LocalDate` | Una fecha de calendario, sin hora ni zona | Fecha de vencimiento de un repaso |
| `LocalDateTime` | Fecha y hora **sin zona**: no es un instante | Una cita «a las 9» en un lugar implícito |
| `ZonedDateTime` | Fecha, hora y zona con sus reglas de horario de verano | Mostrar un instante en Madrid |
| `Duration` / `Period` | Horas y segundos exactos / días, meses y años de calendario | 24 h / 1 día |

Regla práctica: **guarda `Instant`** y conviértelo a la zona del usuario solo para mostrarlo.

`plusDays(1)` y `plus(Duration.ofHours(24))` no son lo mismo cuando cambia la hora:

```java
var creado = ZonedDateTime.of(2026, 10, 24, 10, 0, 0, 0, ZoneId.of("Europe/Madrid"));
creado.plusDays(1);                  // 25/10 a las 10:00: mismo reloj, día siguiente
creado.plus(Duration.ofHours(24));   // 25/10 a las 09:00: 24 horas reales
```

Al formatear, `yyyy` es el año; `YYYY` es el **año de la semana ISO**, que cambia antes o después que el año de calendario:

```java
DateTimeFormatter.ofPattern("dd/MM/YYYY").format(LocalDate.of(2025, 12, 29));
// "29/12/2026": el 29 de diciembre de 2025 ya es la semana 1 de 2026
```

## Error típico

Usar `LocalDateTime.now()` para registrar cuándo ocurrió algo: en un servidor en UTC y un usuario en Madrid, las horas no cuadran y los cambios de hora generan duplicados o huecos.

Las IA siguen generando `java.util.Date` y `SimpleDateFormat`, que son mutables, no son seguros entre hilos y no tienen zona explícita. Son APIs de Java 1.1; en código nuevo, siempre `java.time`.

## Fuentes

- [Javadoc de java.time](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/package-summary.html)
- [Javadoc de DateTimeFormatter (patrones y Y frente a y)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatter.html)
- [dev.java: The Date Time API](https://dev.java/learn/date-time/)
