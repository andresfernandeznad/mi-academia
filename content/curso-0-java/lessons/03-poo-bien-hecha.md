---
id: poo-bien-hecha
title: "POO bien hecha: interfaces, composición, equals y hashCode"
minutes: 9
sources:
  - https://dev.java/learn/interfaces/
  - https://dev.java/learn/inheritance/
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html
---
## Por qué importa

Hoy los tickets se notifican por email; mañana también por Slack. Si la notificación está metida en una jerarquía de clases, cada canal nuevo obliga a tocarla entera. Si es una pieza que se enchufa, añadir un canal es escribir una clase nueva.

## Idea central

Una **interfaz** describe *qué* se puede hacer, sin decir *cómo*:

```java
interface Notificador {
    void notificar(Ticket ticket, String mensaje);
}
```

La **composición** consiste en que una clase *tiene* colaboradores en lugar de *ser* una subclase de ellos:

```java
class ServicioTickets {
    private final Notificador notificador; // email, Slack o un doble en los tests

    ServicioTickets(Notificador notificador) {
        this.notificador = notificador;
    }
}
```

La herencia acopla la subclase a los detalles internos de su padre. Resérvala para relaciones «es un» estables, y prefiere la composición para reutilizar comportamiento.

`equals` y `hashCode` tienen un contrato en `Object`: **si dos objetos son iguales según `equals`, deben devolver el mismo `hashCode`**. `HashSet` y `HashMap` usan primero el `hashCode` para encontrar el «cajón» y después `equals` dentro de él. Si redefines uno, redefine el otro, y con los mismos campos.

## Error típico

Redefinir `equals` sin `hashCode`: dos etiquetas «iguales» acaban en cajones distintos y `set.contains(new Etiqueta("bug"))` devuelve `false`. Si es un objeto de datos, un `record` (lección 4) genera los dos correctamente.

Otro clásico, que las IA generan cuando les pides «una lista que cuente lo que se añade», es heredar de una colección y redefinir `add` y `addAll`. `HashSet.addAll` llama internamente a `add`, así que cada elemento se cuenta dos veces. Con composición (una clase que *tiene* un `Set`) ese acoplamiento oculto desaparece.

## Fuentes

- [dev.java: Interfaces](https://dev.java/learn/interfaces/)
- [dev.java: Inheritance](https://dev.java/learn/inheritance/)
- [Javadoc de Object: contrato de equals y hashCode](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html)
