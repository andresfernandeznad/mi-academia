---
id: lambdas-y-optional
title: "Lambdas y Optional: interfaces funcionales y referencias a métodos"
minutes: 8
sources:
  - https://dev.java/learn/lambdas/
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html
---
## Por qué importa

`buscarTicket("T-42")` devuelve `null` y tres capas más arriba salta un `NullPointerException` sin pista del origen. Si el tipo de retorno dice «puede no haber resultado», quien llama no puede olvidarse de ese caso.

## Idea central

Una **interfaz funcional** tiene un solo método abstracto, y una lambda es una forma corta de implementarla. Las más usadas están en `java.util.function`:

- `Predicate<T>`: `T -> boolean` (filtrar).
- `Function<T, R>`: `T -> R` (transformar).
- `Supplier<T>`: `() -> T` (producir bajo demanda).
- `Consumer<T>`: `T -> void` (actuar).

Una **referencia a método** sustituye a una lambda que solo llama a un método: `t -> t.id()` se escribe `Ticket::id`.

`Optional<T>` representa «hay un valor o no lo hay». Según su propio javadoc, está pensado sobre todo como **tipo de retorno**:

```java
Optional<Ticket> buscar(String id) {
    return Optional.ofNullable(porId.get(id));
}

String agente = buscar("T-42")
        .map(Ticket::agente)
        .orElse("sin asignar");

Ticket t = buscar("T-42")
        .orElseThrow(() -> new TicketNoEncontrado("T-42"));
```

`orElse(x)` evalúa `x` **siempre**, haya valor o no. Si calcular el valor por defecto es caro, usa `orElseGet(() -> ...)`, que solo lo calcula cuando hace falta.

## Error típico

Llamar a `get()` sin comprobar nada: si está vacío, lanza `NoSuchElementException`. Es el mismo error que con `null`, solo que con otro nombre. Usa `orElseThrow` con una excepción que explique el caso.

Las IA también suelen generar métodos que devuelven `Optional` y aun así `return null` en alguna rama. También usan `Optional` como campo o como parámetro, que es justo lo que su documentación desaconseja.

## Fuentes

- [dev.java: Lambda Expressions](https://dev.java/learn/lambdas/)
- [Javadoc de Optional](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Optional.html)
