package dev.miacademia.tickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class TicketTest {

    private static final LocalDate DAY = LocalDate.of(2026, 10, 30);

    @Test
    void stripsSpacesAroundTheId() {
        var ticket = new Ticket("  T-1 ", Priority.HIGH, Status.OPEN, DAY);

        assertThat(ticket.id()).isEqualTo("T-1");
    }

    @Test
    void rejectsABlankId() {
        assertThatThrownBy(() -> new Ticket("   ", Priority.HIGH, Status.OPEN, DAY))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsMissingFields() {
        assertThatThrownBy(() -> new Ticket("T-1", null, Status.OPEN, DAY)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new Ticket("T-1", Priority.HIGH, null, DAY)).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> new Ticket("T-1", Priority.HIGH, Status.OPEN, null)).isInstanceOf(NullPointerException.class);
    }
}
