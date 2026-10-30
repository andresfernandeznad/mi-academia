package dev.miacademia.tickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class StatusTest {

    @ParameterizedTest
    @CsvSource({ "ABIERTO, OPEN", "en_curso, IN_PROGRESS", "' Cerrado', CLOSED" })
    void parsesTheSpanishLabelIgnoringCaseAndSpaces(String text, Status expected) {
        assertThat(Status.parse(text)).isEqualTo(expected);
    }

    @Test
    void rejectsAnUnknownLabelNamingIt() {
        assertThatThrownBy(() -> Status.parse("PENDIENTE"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("PENDIENTE");
    }
}
