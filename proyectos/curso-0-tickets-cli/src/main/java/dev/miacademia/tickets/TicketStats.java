package dev.miacademia.tickets;

import java.util.List;
import java.util.Map;

/** Counts for the report. Every enum value appears, in declaration order, even with 0. */
public final class TicketStats {

    private TicketStats() {
    }

    public static Map<Status, Long> countByStatus(List<Ticket> tickets) {
        // TODO lessons 7 (EnumMap) and 9 (streams)
        throw new UnsupportedOperationException("Por implementar");
    }

    /** Tickets that are not CLOSED, by priority. */
    public static Map<Priority, Long> countOpenByPriority(List<Ticket> tickets) {
        // TODO lessons 7 (EnumMap) and 9 (streams)
        throw new UnsupportedOperationException("Por implementar");
    }
}
