namespace ServiceDesk.API.DTOs.Tickets;

public record TicketResponse(
    int Id,
    string PassengerName,
    int SeatNumber,
    decimal Price,
    DateTimeOffset BookedAt,
    string Status,
    TicketTripResponse Trip
);
