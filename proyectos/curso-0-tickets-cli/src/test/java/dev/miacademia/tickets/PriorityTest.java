package dev.miacademia.tickets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class PriorityTest {

    // Quoted values keep their spaces: unquoted, CsvSource trims them (lesson 12).
    @ParameterizedTest
    @CsvSource({ "ALTA, HIGH", "alta, HIGH", "' Media ', MEDIUM", "baja, LOW" })
    void parsesTheSpanishLabelIgnoringCaseAndSpaces(String text, Priority expected) {
        assertThat(Priority.parse(text)).isEqualTo(expected);
    }

    @Test
    void rejectsAnUnknownLabelNamingIt() {
        assertThatThrownBy(() -> Priority.parse("URGENTISIMA"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("URGENTISIMA");
    }
}
