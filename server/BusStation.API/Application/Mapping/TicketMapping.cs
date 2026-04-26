using ServiceDesk.API.Domain;
using ServiceDesk.API.DTOs.Tickets;

namespace ServiceDesk.API.Application.Mapping;

public static class TicketMapping
{
    public static TicketResponse ToResponse(this Ticket ticket) =>
        new(
            ticket.Id,
            ticket.PassengerName,
            ticket.SeatNumber,
            ticket.Price,
            ticket.BookedAt,
            ticket.Status.ToString(),
            ticket.Trip.ToTicketTripResponse());

    public static SalesReportItemResponse ToSalesResponse(this Ticket ticket) =>
        new(
            ticket.Id,
            ticket.User.DisplayName,
            ticket.User.Email ?? string.Empty,
            ticket.PassengerName,
            ticket.SeatNumber,
            ticket.Price,
            ticket.BookedAt,
            ticket.Status.ToString(),
            ticket.Trip.ToTicketTripResponse());
}
