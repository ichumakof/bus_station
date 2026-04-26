using System.ComponentModel.DataAnnotations;

namespace ServiceDesk.API.DTOs.Routes;

public record UpdateRouteRequest(
    [Required] string DepartureCity,
    [Required] string ArrivalCity,
    [Range(10, 600)] int TravelMinutes,
    bool IsActive
);
