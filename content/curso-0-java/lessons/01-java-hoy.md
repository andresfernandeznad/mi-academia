---
id: java-hoy
title: "Java hoy: JDK, JShell y Maven"
minutes: 8
sources:
  - https://dev.java/learn/
  - https://openjdk.org/jeps/512
  - https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html
---
## Por qué importa

Un ticket de soporte llega con «en mi máquina funciona». La mitad de las veces el problema no está en el código, sino en qué JDK compiló, cuál ejecuta y qué versión de Java se le pidió a Maven. Saber dónde vive cada pieza te ahorra horas de diagnóstico.

## Idea central

El **JDK** trae las herramientas: `javac` compila, `java` ejecuta y `jshell` es un REPL para probar código sin crear un proyecto. Hoy tienes tres formas de ejecutar Java, de menos a más estructura:

1. **JShell**, para probar una expresión o una API en segundos.
2. **Un fichero suelto**: `java Main.java` lo compila en memoria y lo ejecuta. Desde Java 25 ese fichero puede ser mínimo:

```java
void main() {
    IO.println("Hola, tickets");
}
```

3. **Un proyecto Maven**, cuando hay dependencias, tests o más de un paquete. Maven impone una estructura estándar: `pom.xml` en la raíz, código en `src/main/java` y tests en `src/test/java`. Comandos como `mvn test` o `mvn package` recorren las fases del ciclo de vida en orden.

La versión de Java del proyecto se fija con una sola propiedad:

```xml
<properties>
  <maven.compiler.release>25</maven.compiler.release>
</properties>
```

## Error típico

Usar `maven.compiler.source` y `maven.compiler.target` en lugar de `release`. Con `source` y `target` puedes compilar con un JDK 25 contra la API de 25 y generar bytecode «para 21»: compila, pero en producción falla con `NoSuchMethodError` en cuanto usas un método nuevo. `release` comprueba también la API de la plataforma elegida.

Las IA que generan `pom.xml` suelen copiar plantillas antiguas con `source`/`target` en `1.8` o versiones viejas de los plugins. Revisa siempre esas líneas.

Otro clásico: `JAVA_HOME` apunta a un JDK y el `java` del `PATH` a otro. Comprueba ambos con `java -version` y `mvn -version`.

## Fuentes

- [dev.java: Learn Java](https://dev.java/learn/)
- [JEP 512: Compact Source Files and Instance Main Methods](https://openjdk.org/jeps/512)
- [Maven: Standard Directory Layout](https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html)
