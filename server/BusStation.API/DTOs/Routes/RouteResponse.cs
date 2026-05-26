namespace BusStation.API.DTOs.Routes;

public record RouteResponse(
    int Id,
    string DepartureCity,
    string ArrivalCity,
    int TravelMinutes,
    bool IsActive
);
