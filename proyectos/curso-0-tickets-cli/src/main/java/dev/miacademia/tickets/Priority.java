package dev.miacademia.tickets;

/** Ticket priority. The CSV uses the Spanish label (ALTA, MEDIA, BAJA). */
public enum Priority {
    HIGH("ALTA"), MEDIUM("MEDIA"), LOW("BAJA");

    private final String label;

    Priority(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }

    /**
     * Parses a CSV value, ignoring case and surrounding spaces ("alta", " Media ").
     *
     * @throws IllegalArgumentException with the unknown value in its message
     */
    public static Priority parse(String text) {
        // TODO lesson 2 (String), lesson 5 (enums)
        throw new UnsupportedOperationException("Por implementar");
    }
}
