using BusStation.API.Domain;

namespace BusStation.API.Application.Abstractions.Repositories;

public interface ITicketRepository
{
    IQueryable<Ticket> Query();
    Task<Ticket?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<Ticket>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task AddAsync(Ticket ticket, CancellationToken cancellationToken = default);
    void RemoveRange(IEnumerable<Ticket> tickets);
}
