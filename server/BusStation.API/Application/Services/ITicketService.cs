using ServiceDesk.API.DTOs.Tickets;

namespace ServiceDesk.API.Application.Services;

public interface ITicketService
{
    Task<IEnumerable<TicketResponse>> GetMyAsync(string userId);
    Task<TicketResponse> CreateAsync(CreateTicketRequest request, string userId);
    Task<SalesReportResponse> GetSalesReportAsync(DateOnly? dateFrom, DateOnly? dateTo, int? routeId);
}
