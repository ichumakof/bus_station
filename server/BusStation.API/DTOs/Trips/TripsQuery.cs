namespace ServiceDesk.API.DTOs.Trips;

public record TripsQuery(
    string? FromCity,
    string? ToCity,
    DateOnly? Date,
    int? RouteId,
    string? Status,
    int Page = 1,
    int PageSize = 20
);
