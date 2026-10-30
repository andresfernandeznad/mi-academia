package dev.miacademia.tickets;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class TicketImporterTest {

    private final TicketImporter importer = new TicketImporter();

    @Test
    void importsValidLinesAndSkipsTheHeader() {
        var result = importer.importLines(List.of(
                "id;prioridad;estado;creado",
                "T-1;ALTA;ABIERTO;2026-10-30",
                "T-2;baja;cerrado;2026-10-28"));

        assertThat(result.errors()).isEmpty();
        assertThat(result.tickets()).containsExactly(
                new Ticket("T-1", Priority.HIGH, Status.OPEN, LocalDate.of(2026, 10, 30)),
                new Ticket("T-2", Priority.LOW, Status.CLOSED, LocalDate.of(2026, 10, 28)));
    }

    @Test
    void treatsTheFirstLineAsDataWhenItIsNotAHeader() {
        var result = importer.importLines(List.of("T-1;ALTA;ABIERTO;2026-10-30"));

        assertThat(result.tickets()).extracting(Ticket::id).containsExactly("T-1");
    }

    @Test
    void ignoresBlankLinesButKeepsCountingThem() {
        var result = importer.importLines(List.of(
                "id;prioridad;estado;creado",
                "",
                "T-1;ALTA;ABIERTO;2026-10-30",
                "   ",
                "T-2;MUY_ALTA;ABIERTO;2026-10-30"));

        assertThat(result.tickets()).extracting(Ticket::id).containsExactly("T-1");
        assertThat(result.errors()).singleElement().asString().contains("Línea 5");
    }

    @Test
    void reportsEveryInvalidLineWithItsNumberAndKeepsGoing() {
        var result = importer.importLines(List.of(
                "id;prioridad;estado;creado",
                "T-1;URGENTISIMA;ABIERTO;2026-10-30",
                "T-2;ALTA;PENDIENTE;2026-10-30",
                "T-3;ALTA;ABIERTO;30/10/2026",
                "T-4;ALTA;ABIERTO",
                ";ALTA;ABIERTO;2026-10-30",
                "T-6;MEDIA;EN_CURSO;2026-10-30"));

        assertThat(result.tickets()).extracting(Ticket::id).containsExactly("T-6");
        assertThat(result.errors()).hasSize(5);
        assertThat(result.errors().get(0)).contains("Línea 2", "URGENTISIMA");
        assertThat(result.errors().get(1)).contains("Línea 3", "PENDIENTE");
        assertThat(result.errors().get(2)).contains("Línea 4", "30/10/2026");
        assertThat(result.errors().get(3)).contains("Línea 5", "4 columnas");
        assertThat(result.errors().get(4)).contains("Línea 6");
    }

    @Test
    void keepsTheFirstTicketWhenAnIdIsRepeated() {
        var result = importer.importLines(List.of(
                "T-1;ALTA;ABIERTO;2026-10-30",
                "T-1;BAJA;CERRADO;2026-10-31"));

        assertThat(result.tickets()).singleElement().extracting(Ticket::priority).isEqualTo(Priority.HIGH);
        assertThat(result.errors()).singleElement().asString().contains("Línea 2", "T-1");
    }

    @Test
    void returnsResultsThatCannotBeModified() {
        var result = importer.importLines(List.of("T-1;ALTA;ABIERTO;2026-10-30"));

        assertThat(result.tickets()).isUnmodifiable();
        assertThat(result.errors()).isUnmodifiable();
    }
}
