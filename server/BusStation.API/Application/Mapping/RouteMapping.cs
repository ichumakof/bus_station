using ServiceDesk.API.Domain;
using ServiceDesk.API.DTOs.Routes;

namespace ServiceDesk.API.Application.Mapping;

public static class RouteMapping
{
    public static RouteResponse ToResponse(this BusRoute route) =>
        new(route.Id, route.DepartureCity, route.ArrivalCity, route.TravelMinutes, route.IsActive);
}
