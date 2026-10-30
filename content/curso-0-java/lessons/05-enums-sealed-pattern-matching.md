---
id: enums-sealed-pattern-matching
title: "Enums, sealed y pattern matching: modelar estados"
minutes: 9
sources:
  - https://openjdk.org/jeps/409
  - https://openjdk.org/jeps/441
  - https://openjdk.org/jeps/440
---
## Por qué importa

Añades el estado «Escalado» a los tickets. ¿En cuántos sitios del código hay que tratarlo? Si el compilador te lo dice, no se te olvida ninguno. Ese es el valor de modelar los estados con tipos cerrados.

## Idea central

Si los estados no llevan datos, un **enum** basta. Un `switch` *expresión* sobre un enum tiene que cubrir todos los valores, o no compila:

```java
enum Estado { ABIERTO, EN_CURSO, CERRADO }

String etiqueta = switch (estado) {
    case ABIERTO -> "Pendiente";
    case EN_CURSO -> "En curso";
    case CERRADO -> "Resuelto";
};
```

Si cada caso lleva datos distintos, usa una **interfaz sellada** (Java 17) con records. `permits` fija la lista cerrada de implementaciones:

```java
sealed interface Evento permits Creado, Asignado, Cerrado { }
record Creado(String id) implements Evento { }
record Asignado(String id, String agente) implements Evento { }
record Cerrado(String id, LocalDate fecha) implements Evento { }
```

Con **pattern matching en switch** y **record patterns** (Java 21), cada caso desestructura sus datos, y el compilador comprueba que no falte ninguno:

```java
String describir(Evento e) {
    return switch (e) {
        case Creado c -> "Nuevo ticket " + c.id();
        case Asignado(var id, var agente) -> id + " asignado a " + agente;
        case Cerrado(var id, var fecha) -> id + " cerrado el " + fecha;
    };
}
```

Si mañana añades `record Escalado(...) implements Evento`, cada `switch` que no lo trate deja de compilar.

## Error típico

Añadir `default ->` «por si acaso». Desactiva la comprobación de exhaustividad: el nuevo estado cae en `default` en silencio y el error aparece en producción, no al compilar. Las IA lo añaden casi siempre; quítalo cuando el tipo es un enum o una interfaz sellada.

El otro error es modelar estados con `String`: `"CERADO"` compila sin problema.

## Fuentes

- [JEP 409: Sealed Classes](https://openjdk.org/jeps/409)
- [JEP 441: Pattern Matching for switch](https://openjdk.org/jeps/441)
- [JEP 440: Record Patterns](https://openjdk.org/jeps/440)
