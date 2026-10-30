---
id: tipos-y-texto
title: "Tipos y texto: primitivos, var, String y text blocks"
minutes: 8
sources:
  - https://dev.java/learn/language-basics/
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html
  - https://openjdk.org/jeps/378
---
## Por qué importa

Un informe dice que hay 0 tickets urgentes cuando hay 200. El código compara dos `Integer` con `==` y funciona en las pruebas, con pocos tickets, pero falla en producción. Distinguir valores de referencias evita este tipo de fallo silencioso.

## Idea central

Java tiene dos familias de tipos:

- **Primitivos** (`int`, `long`, `double`, `boolean`, `char`…): guardan el valor directamente y nunca son `null`.
- **Referencias** (`Integer`, `String`, cualquier objeto): guardan la dirección de un objeto y pueden ser `null`.

El **autoboxing** convierte entre `int` e `Integer` sin que lo veas. Por eso `==` engaña: entre referencias compara *identidad*, no valor. `Integer.valueOf` reutiliza los objetos entre -128 y 127, así que `==` «funciona» con números pequeños y deja de hacerlo a partir de 128:

```java
Integer a = 127, b = 127;
Integer c = 128, d = 128;
a == b;       // true: mismo objeto de la caché
c == d;       // false: dos objetos distintos
c.equals(d);  // true: mismo valor
```

`var` (Java 10) deja que el compilador deduzca el tipo de una variable local. El tipo sigue siendo estático; solo te ahorras escribirlo cuando ya es evidente:

```java
var tickets = new ArrayList<Ticket>(); // es un ArrayList<Ticket>
```

`String` es inmutable: `trim()`, `toUpperCase()` o `replace()` devuelven un `String` nuevo. Para texto de varias líneas (SQL, JSON, plantillas) usa **text blocks** (Java 15):

```java
String consulta = """
    SELECT id, estado
    FROM tickets
    WHERE prioridad = 'ALTA'
    """;
```

## Error típico

Comparar `String` o wrappers con `==`. Los literales iguales comparten objeto, así que `"ABIERTO" == "ABIERTO"` da `true` en un test, pero un `String` leído de un fichero es otro objeto y la comparación falla. Usa siempre `equals`.

El segundo clásico es desempaquetar un `null`: `int total = contador;` lanza `NullPointerException` si el `Integer contador` es `null`. Las IA lo generan a menudo al mezclar `Map<String, Integer>.get(...)` con aritmética.

## Fuentes

- [dev.java: Language Basics](https://dev.java/learn/language-basics/)
- [Javadoc de Integer (caché de valueOf)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Integer.html)
- [JEP 378: Text Blocks](https://openjdk.org/jeps/378)
