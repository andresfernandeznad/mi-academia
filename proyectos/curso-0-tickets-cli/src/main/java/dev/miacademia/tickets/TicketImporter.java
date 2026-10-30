package dev.miacademia.tickets;

import java.util.List;

/**
 * Turns CSV lines ("id;prioridad;estado;creado") into tickets. See README.md for the rules.
 * One bad line never stops the import: it becomes an error that names its line number.
 */
public class TicketImporter {

    public ImportResult importLines(List<String> lines) {
        // TODO lessons 7 (collections), 10 (exceptions), 11 (dates)
        throw new UnsupportedOperationException("Por implementar");
    }
}
