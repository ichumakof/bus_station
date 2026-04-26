using System.ComponentModel.DataAnnotations;

namespace ServiceDesk.API.DTOs.Trips;

public record UpdateTripRequest(
    [Range(1, int.MaxValue)] int RouteId,
    DateTimeOffset DepartureTime,
    [Range(typeof(decimal), "1", "100000")] decimal Price,
    [Range(1, 100)] int TotalSeats,
    [Required] string Status
);
