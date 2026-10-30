---
id: streams
title: "Streams: map, filter, collect y groupingBy en casos reales"
minutes: 9
sources:
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html
  - https://dev.java/learn/api/streams/
---
## Por qué importa

El informe de la CLI necesita «tickets abiertos por prioridad». Con bucles son quince líneas de mapas, contadores y condiciones; con streams es una expresión que se lee como la frase que la pide.

## Idea central

Un stream es una **tubería**: una fuente, operaciones **intermedias** y una operación **terminal**.

- Las intermedias (`filter`, `map`, `sorted`) son **perezosas**: no hacen nada hasta que llega la terminal.
- La terminal (`toList`, `count`, `collect`) recorre los datos una sola vez y cierra el stream.

```java
List<String> urgentes = tickets.stream()
        .filter(t -> t.prioridad() == Prioridad.ALTA)
        .map(Ticket::id)
        .sorted()
        .toList();                 // Java 16: lista inmutable
```

Para agrupar y contar se combinan `Collectors.groupingBy` y `counting`:

```java
Map<Estado, Long> porEstado = tickets.stream()
        .collect(Collectors.groupingBy(Ticket::estado, Collectors.counting()));
```

Para que el informe salga en el orden del enum (lección 7), indica el mapa de destino:

```java
Map<Estado, Long> porEstado = tickets.stream()
        .collect(Collectors.groupingBy(Ticket::estado,
                () -> new EnumMap<>(Estado.class), Collectors.counting()));
```

## Error típico

Reutilizar un stream: guardarlo en una variable y recorrerlo dos veces lanza `IllegalStateException`, porque un stream se consume una sola vez. Si necesitas dos resultados, crea dos streams desde la colección.

Las IA también rellenan listas externas desde `forEach` (`resultado.add(...)`). Funciona en secuencial y se rompe en cuanto alguien añade `parallel()`. Usa `collect` o `toList`, que no comparten estado.

## Fuentes

- [Javadoc de java.util.stream](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html)
- [Javadoc de Collectors](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html)
- [dev.java: The Stream API](https://dev.java/learn/api/streams/)
