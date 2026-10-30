package dev.miacademia.tickets;

/** Ticket status. The CSV uses the Spanish label (ABIERTO, EN_CURSO, CERRADO). */
public enum Status {
    OPEN("ABIERTO"), IN_PROGRESS("EN_CURSO"), CLOSED("CERRADO");

    private final String label;

    Status(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    /**
     * Parses a CSV value, ignoring case and surrounding spaces.
     *
     * @throws IllegalArgumentException with the unknown value in its message
     */
    public static Status parse(String text) {
        // TODO lesson 2 (String), lesson 5 (enums)
        throw new UnsupportedOperationException("Por implementar");
    }
}
