---
id: genericos-sin-miedo
title: "Genéricos sin miedo: comodines y la regla PECS"
minutes: 9
sources:
  - https://dev.java/learn/generics/
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html
---
## Por qué importa

Escribes una utilidad que suma importes de una lista y no acepta `List<Integer>`, solo `List<Number>`. La «arreglas» con un cast o con un tipo crudo (`List`) y acabas de perder la comprobación de tipos que el compilador hacía gratis. Entender los comodines evita ese parche.

## Idea central

Los genéricos comprueban tipos **al compilar** y desaparecen al ejecutar (*type erasure*). Por eso no se puede hacer `new T()` ni `instanceof List<String>`.

Son **invariantes**: aunque `Integer` sea un `Number`, `List<Integer>` *no* es una `List<Number>`. Si lo fuera, podrías meter un `Double` en una lista de enteros. Los **comodines** flexibilizan esa regla con seguridad:

- `List<? extends Number>`: una lista de *algún* subtipo de `Number`. Puedes **leer** `Number` de ella, pero no añadir nada (salvo `null`), porque no sabes de qué subtipo es.
- `List<? super Integer>`: una lista que acepta `Integer`. Puedes **añadir** enteros, pero al leer solo sabes que obtienes `Object`.

Regla **PECS**: *Producer Extends, Consumer Super*. Si la colección te **produce** valores, usa `extends`; si los **consume**, usa `super`. La propia JDK lo aplica en `Collections.copy`:

```java
public static <T> void copy(List<? super T> dest, List<? extends T> src)
```

```java
double total(List<? extends Number> importes) {
    double suma = 0;
    for (Number n : importes) suma += n.doubleValue(); // leer: bien
    return suma;
}
```

## Error típico

Usar tipos crudos (`List lista`) o casts para «hacer que compile». El compilador solo avisa con un *warning*, y el error se convierte en una `ClassCastException` en producción, lejos de donde se originó. Las IA lo hacen cuando un genérico no encaja a la primera; la solución suele ser un comodín en la firma.

## Fuentes

- [dev.java: Generics](https://dev.java/learn/generics/)
- [Javadoc de Collections (firma de copy)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html)
