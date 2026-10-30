package dev.miacademia.tickets;

import java.util.List;

/** Valid tickets plus one human-readable error per rejected line. Both lists are unmodifiable. */
public record ImportResult(List<Ticket> tickets, List<String> errors) {
    // TODO lesson 4: make sure nobody can modify the lists afterwards
}
