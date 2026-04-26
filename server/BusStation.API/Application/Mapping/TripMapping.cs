using ServiceDesk.API.Domain;
using ServiceDesk.API.DTOs.Tickets;
using ServiceDesk.API.DTOs.Trips;

namespace ServiceDesk.API.Application.Mapping;

public static class TripMapping
{
    public static TripResponse ToResponse(this Trip trip) =>
        new(
            trip.Id,
            trip.RouteId,
            trip.Route.ToResponse(),
            trip.DepartureTime,
            trip.ArrivalTime,
            trip.Price,
            trip.TotalSeats,
            trip.FreeSeats,
            trip.Status.ToString());

    public static TicketTripResponse ToTicketTripResponse(this Trip trip) =>
        new(
            trip.Id,
            trip.Route.ToResponse(),
            trip.DepartureTime,
            trip.ArrivalTime);
}
