---
id: records-e-inmutabilidad
title: "Records e inmutabilidad: cuándo record y cuándo clase"
minutes: 8
sources:
  - https://openjdk.org/jeps/395
  - https://dev.java/learn/records/
---
## Por qué importa

Un ticket importado del CSV pasa por validación, estadísticas e informe. Si cualquiera de esos pasos puede modificarlo, un error en el informe obliga a revisar todo el camino. Un objeto inmutable solo se puede crear bien o no crearse.

## Idea central

Un **record** (Java 16) es una clase para transportar datos inmutables. Con una línea obtienes el constructor, los accesores (`id()`, no `getId()`), `equals`, `hashCode` y `toString`:

```java
record Ticket(String id, Prioridad prioridad, LocalDate creado) { }
```

La validación va en el **constructor compacto**. Ahí se reasignan los *parámetros*; los campos se asignan solos al final:

```java
record Ticket(String id, Prioridad prioridad, List<String> etiquetas) {
    Ticket {
        Objects.requireNonNull(prioridad, "prioridad");
        id = id.strip();
        etiquetas = List.copyOf(etiquetas); // copia defensiva e inmutable
    }
}
```

La inmutabilidad de un record es **superficial**: el campo no cambia, pero si apunta a una `ArrayList`, el contenido de la lista sí puede cambiar. `List.copyOf` lo evita.

Cuándo usar cada uno:

- **Record**: valores (un ticket importado, una fila de estadísticas, un DTO). Es `final` y puede implementar interfaces.
- **Clase**: estado que cambia con el tiempo, invariantes entre varios campos que se modifican juntos o entidades de frameworks que exigen constructor vacío y setters (JPA).

Para «modificar» un record se devuelve uno nuevo: `ticket.conPrioridad(Prioridad.ALTA)`.

## Error típico

Escribir `this.id = id.strip();` en el constructor compacto: no compila, porque los campos son `final` y se asignan después. Lo correcto es `id = id.strip();`.

Las IA tienden a convertir los records en clases con setters o a usar `@Data` de Lombok por costumbre. Eso pierde la inmutabilidad, que era precisamente el motivo de usar un record.

## Fuentes

- [JEP 395: Records](https://openjdk.org/jeps/395)
- [dev.java: Using Record to Model Immutable Data](https://dev.java/learn/records/)
