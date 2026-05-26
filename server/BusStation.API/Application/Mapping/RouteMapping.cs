using BusStation.API.Domain;
using BusStation.API.DTOs.Routes;

namespace BusStation.API.Application.Mapping;

public static class RouteMapping
{
    public static RouteResponse ToResponse(this BusRoute route) =>
        new(route.Id, route.DepartureCity, route.ArrivalCity, route.TravelMinutes, route.IsActive);
}
