---
id: excepciones
title: "Excepciones: checked frente a unchecked y try-with-resources"
minutes: 8
sources:
  - https://dev.java/learn/exceptions/
  - https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AutoCloseable.html
---
## Por qué importa

La importación falla y el log solo dice `No se pudo leer tickets.csv`. ¿Permisos? ¿Fichero inexistente? ¿Codificación? La causa estaba en la excepción original y alguien la tiró. Tratar bien las excepciones es dejar pistas a quien depure mañana, que muchas veces eres tú.

## Idea central

- **Checked** (heredan de `Exception` pero no de `RuntimeException`, como `IOException`): el compilador obliga a capturarlas o declararlas. Encajan con fallos **externos y recuperables**: un fichero que no está, una red caída.
- **Unchecked** (`RuntimeException` y sus hijas, como `IllegalArgumentException`): señalan **errores de programación** o contratos rotos. No obligan a nada.

Al envolver una excepción, **pasa la causa** como segundo argumento para conservar la traza completa:

```java
try {
    return Files.readAllLines(csv);
} catch (IOException e) {
    throw new UncheckedIOException("No se pudo leer " + csv, e);
}
```

**try-with-resources** cierra cualquier `AutoCloseable` al salir, en orden inverso a su apertura, aunque haya una excepción:

```java
try (var lector = Files.newBufferedReader(csv)) {
    return lector.lines().map(this::parsear).toList();
}
```

Si falla el cuerpo y además falla `close()`, se propaga la excepción del cuerpo y la del cierre queda **suprimida** dentro de ella (`getSuppressed()`): no se pierde ninguna de las dos.

Las excepciones son para lo **excepcional**. Una línea mal formada en un CSV de 10.000 líneas no lo es: se espera. Recoge esos errores como datos y continúa.

## Error típico

`catch (Exception e) { e.printStackTrace(); }` o, peor, un `catch` vacío: el programa sigue con un estado incorrecto y el error aparece lejos de su causa. Las IA generan este patrón constantemente para «hacer que compile».

Igual de dañino es relanzar sin la causa: `throw new IllegalStateException("Falló")` sin la `e` borra justo la información que necesitabas.

## Fuentes

- [dev.java: Exceptions](https://dev.java/learn/exceptions/)
- [JLS 14.20.3: try-with-resources](https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3)
- [Javadoc de AutoCloseable](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/AutoCloseable.html)
