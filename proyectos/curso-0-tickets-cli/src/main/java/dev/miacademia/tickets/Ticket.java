package dev.miacademia.tickets;

import java.time.LocalDate;

/**
 * A valid ticket: no null fields and a non-blank id without surrounding spaces.
 * An invalid ticket must not be constructible.
 */
public record Ticket(String id, Priority priority, Status status, LocalDate createdOn) {
    // TODO lesson 4: compact constructor that validates and normalizes the id
}
