package dev.miacademia.tickets;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/** Entry point: java -cp target/classes dev.miacademia.tickets.Main tickets.csv */
public final class Main {

    private Main() {
    }

    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("Uso: java -cp target/classes dev.miacademia.tickets.Main <fichero.csv>");
            System.exit(2);
        }
        try {
            var result = new TicketImporter().importLines(Files.readAllLines(Path.of(args[0])));
            System.out.print(Report.render(result));
        } catch (IOException e) {
            System.err.println("No se pudo leer " + args[0] + ": " + e);
            System.exit(1);
        }
    }
}
