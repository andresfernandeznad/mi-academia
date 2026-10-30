---
id: colecciones
title: "Colecciones: List, Set y Map, cuál elegir y su coste"
minutes: 9
sources:
  - https://dev.java/learn/api/collections-framework/
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html
  - https://openjdk.org/jeps/431
---
## Por qué importa

Importar 100.000 tickets tarda minutos. El motivo: por cada línea se comprueba si el id ya existe con `lista.contains(id)`, que recorre la lista entera. Con un `Set` la misma comprobación es casi instantánea. Elegir la colección es elegir el coste.

## Idea central

| Necesitas | Usa | Coste típico |
| --- | --- | --- |
| Orden y acceso por posición | `ArrayList` | `get` constante; `contains` lineal |
| Sin duplicados y comprobar pertenencia | `HashSet` | `add` y `contains` constantes de media |
| Sin duplicados y en orden de inserción | `LinkedHashSet` | Igual que `HashSet` |
| Ordenado por clave | `TreeSet` / `TreeMap` | `log n` |
| Buscar por clave | `HashMap` | `get` y `put` constantes de media |
| Claves de un enum | `EnumMap` | Compacto y en el orden del enum |

`LinkedList` casi nunca gana a `ArrayList` en la práctica: úsala solo con una medición que lo justifique.

`List.of`, `Set.of` y `Map.of` crean colecciones **inmutables**: cualquier `add` o `put` lanza `UnsupportedOperationException`, y no admiten `null`. Para una copia modificable: `new ArrayList<>(List.of(...))`.

Desde Java 21, las colecciones con orden implementan **`SequencedCollection`**: `getFirst()`, `getLast()` y `reversed()` sin calcular índices.

```java
var procesados = new HashSet<String>();
for (var ticket : tickets) {
    if (!procesados.add(ticket.id())) {   // add devuelve false si ya estaba
        duplicados.add(ticket.id());
    }
}
```

## Error típico

`contains` sobre una `List` dentro de un bucle: el algoritmo pasa a ser cuadrático sin que se note con los datos de prueba. Las IA usan `List` por defecto en casi todo; pregúntate siempre qué operación se repite.

El segundo error es intentar modificar el resultado de `List.of` o de `stream().toList()` (lección 9): ambos son inmutables y fallan en ejecución, no al compilar.

## Fuentes

- [dev.java: The Collections Framework](https://dev.java/learn/api/collections-framework/)
- [Javadoc de List (listas inmutables)](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html)
- [JEP 431: Sequenced Collections](https://openjdk.org/jeps/431)
