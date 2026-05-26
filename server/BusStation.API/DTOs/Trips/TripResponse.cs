using BusStation.API.DTOs.Routes;

namespace BusStation.API.DTOs.Trips;

public record TripResponse(
    int Id,
    int RouteId,
    RouteResponse Route,
    DateTimeOffset DepartureTime,
    DateTimeOffset ArrivalTime,
    decimal Price,
    int TotalSeats,
    int FreeSeats,
    string Status
);
