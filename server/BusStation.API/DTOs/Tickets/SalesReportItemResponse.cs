namespace ServiceDesk.API.DTOs.Tickets;

public record SalesReportItemResponse(
    int Id,
    string CustomerName,
    string CustomerEmail,
    string PassengerName,
    int SeatNumber,
    decimal Price,
    DateTimeOffset BookedAt,
    string Status,
    TicketTripResponse Trip
);
