using ServiceDesk.API.DTOs.Routes;

namespace ServiceDesk.API.DTOs.Tickets;

public record TicketTripResponse(
    int Id,
    RouteResponse Route,
    DateTimeOffset DepartureTime,
    DateTimeOffset ArrivalTime
);
