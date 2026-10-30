package dev.miacademia.tickets;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class ReportTest {

    private static final LocalDate DAY = LocalDate.of(2026, 10, 30);

    @Test
    void printsTotalsErrorsAndBreakdowns() {
        var result = new ImportResult(
                List.of(
                        new Ticket("T-1", Priority.HIGH, Status.OPEN, DAY),
                        new Ticket("T-2", Priority.MEDIUM, Status.IN_PROGRESS, DAY),
                        new Ticket("T-3", Priority.HIGH, Status.CLOSED, DAY)),
                List.of("Línea 5: prioridad desconocida «URGENTISIMA»"));

        assertThat(Report.render(result)).isEqualTo("""
                Tickets importados: 3
                Errores: 1
                  - Línea 5: prioridad desconocida «URGENTISIMA»
                Por estado:
                  ABIERTO: 1
                  EN_CURSO: 1
                  CERRADO: 1
                Abiertos por prioridad:
                  ALTA: 1
                  MEDIA: 1
                  BAJA: 0
                """);
    }

    @Test
    void omitsTheErrorListWhenThereAreNone() {
        var result = new ImportResult(List.of(new Ticket("T-1", Priority.LOW, Status.OPEN, DAY)), List.of());

        assertThat(Report.render(result))
                .startsWith("Tickets importados: 1\nErrores: 0\nPor estado:\n")
                .doesNotContain("  - ");
    }
}
