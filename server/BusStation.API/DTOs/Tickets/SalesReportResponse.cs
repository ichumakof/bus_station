namespace ServiceDesk.API.DTOs.Tickets;

public record SalesReportResponse(
    int TotalTickets,
    decimal TotalRevenue,
    IEnumerable<SalesReportItemResponse> Items
);
