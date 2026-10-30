package dev.miacademia.tickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class TicketStatsTest {

    private static final LocalDate DAY = LocalDate.of(2026, 10, 30);

    private static Ticket ticket(String id, Priority priority, Status status) {
        return new Ticket(id, priority, status, DAY);
    }

    private final List<Ticket> tickets = List.of(
            ticket("T-1", Priority.HIGH, Status.OPEN),
            ticket("T-2", Priority.HIGH, Status.CLOSED),
            ticket("T-3", Priority.LOW, Status.IN_PROGRESS),
            ticket("T-4", Priority.HIGH, Status.OPEN));

    @Test
    void countsByStatusInEnumOrderIncludingZeros() {
        assertThat(TicketStats.countByStatus(tickets)).containsExactly(
                entry(Status.OPEN, 2L),
                entry(Status.IN_PROGRESS, 1L),
                entry(Status.CLOSED, 1L));

        assertThat(TicketStats.countByStatus(List.of())).containsExactly(
                entry(Status.OPEN, 0L),
                entry(Status.IN_PROGRESS, 0L),
                entry(Status.CLOSED, 0L));
    }

    @Test
    void countsTicketsThatAreNotClosedByPriority() {
        assertThat(TicketStats.countOpenByPriority(tickets)).containsExactly(
                entry(Priority.HIGH, 2L),
                entry(Priority.MEDIUM, 0L),
                entry(Priority.LOW, 1L));
    }
}
