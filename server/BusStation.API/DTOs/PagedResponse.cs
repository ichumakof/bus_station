namespace ServiceDesk.API.DTOs;

public record PagedResponse<T>(
    IEnumerable<T> Items,
    int Page,
    int PageSize,
    int Total
);
