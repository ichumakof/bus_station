using BusStation.API.Domain;
using BusStation.API.DTOs.Tickets;
using BusStation.API.DTOs.Trips;

namespace BusStation.API.Application.Mapping;

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
