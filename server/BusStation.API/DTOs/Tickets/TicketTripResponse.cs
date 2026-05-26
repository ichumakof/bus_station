using BusStation.API.DTOs.Routes;

namespace BusStation.API.DTOs.Tickets;

public record TicketTripResponse(
    int Id,
    RouteResponse Route,
    DateTimeOffset DepartureTime,
    DateTimeOffset ArrivalTime
);
