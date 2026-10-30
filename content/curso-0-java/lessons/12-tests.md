---
id: tests
title: "Tests: JUnit y AssertJ, la base para todo el roadmap"
minutes: 9
sources:
  - https://docs.junit.org/current/user-guide/
  - https://assertj.github.io/doc/
  - https://maven.apache.org/surefire/maven-surefire-plugin/examples/inclusion-exclusion.html
---
## Por qué importa

Todos los proyectos del roadmap se corrigen con tests: te entregan tests en rojo y tu trabajo es ponerlos en verde. Y cuando una IA te genere código, los tests son la forma más rápida de saber si hace lo que dice.

## Idea central

**JUnit** (versión 6, sucesor directo de JUnit 5 con el mismo modelo de programación, *Jupiter*) ejecuta los tests. **AssertJ** expresa lo que esperas de forma legible. Un buen test sigue el patrón *preparar, actuar, comprobar*:

Así son los tests del proyecto de este curso (en inglés, como el código):

```java
class TicketImporterTest {

    @Test
    void reportsInvalidLinesAndKeepsGoing() {
        var importer = new TicketImporter();                     // preparar

        var result = importer.importLines(List.of(               // actuar
                "T-1;ALTA;ABIERTO;2026-10-30",
                "T-2;URGENTISIMA;ABIERTO;2026-10-30"));

        assertThat(result.tickets())                             // comprobar
                .extracting(Ticket::id)
                .containsExactly("T-1");
        assertThat(result.errors()).singleElement()
                .asString().contains("Línea 2", "URGENTISIMA");
    }

    @ParameterizedTest
    @CsvSource({ "alta, HIGH", "MEDIA, MEDIUM", "' baja ', LOW" }) // sin comillas, CsvSource recorta los espacios
    void parsesPrioritiesIgnoringCaseAndSpaces(String text, Priority expected) {
        assertThat(Priority.parse(text)).isEqualTo(expected);
    }
}
```

Para comprobar excepciones: `assertThatThrownBy(() -> ...).isInstanceOf(...).hasMessageContaining(...)`.

Maven Surefire solo ejecuta por defecto las clases cuyo nombre empieza por `Test` o termina en `Test`, `Tests` o `TestCase`. Ya lo viste en la lección 1 con la carpeta: con el nombre pasa lo mismo.

## Error típico

`assertThat(lista.isEmpty());` **no comprueba nada**: crea la aserción pero nunca la evalúa, así que el test pasa siempre. Lo correcto es `assertThat(lista).isEmpty();`. Un test que no puede fallar es peor que no tener test, porque da falsa confianza.

Las IA generan a menudo tests que repiten la implementación: calculan el resultado esperado con la misma fórmula que el código, así que si la fórmula está mal, el test también. Escribe los valores esperados a mano, a partir de ejemplos concretos.

## Fuentes

- [JUnit User Guide](https://docs.junit.org/current/user-guide/)
- [AssertJ: documentación](https://assertj.github.io/doc/)
- [Maven Surefire: qué clases se ejecutan](https://maven.apache.org/surefire/maven-surefire-plugin/examples/inclusion-exclusion.html)
