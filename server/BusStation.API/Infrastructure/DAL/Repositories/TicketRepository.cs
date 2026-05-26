using BusStation.API.Application.Abstractions.Repositories;
using BusStation.API.Domain;
using BusStation.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BusStation.API.Infrastructure.DAL.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly AppDbContext _db;

    public TicketRepository(AppDbContext db)
    {
        _db = db;
    }

    public IQueryable<Ticket> Query() =>
        _db.Tickets
            .Include(ticket => ticket.User)
            .Include(ticket => ticket.Trip)
            .ThenInclude(trip => trip.Route)
            .AsNoTracking();

    public Task<Ticket?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        Query().FirstOrDefaultAsync(ticket => ticket.Id == id, cancellationToken);

    public Task<List<Ticket>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default) =>
        _db.Tickets
            .Where(ticket => ticket.UserId == userId)
            .ToListAsync(cancellationToken);

    public Task AddAsync(Ticket ticket, CancellationToken cancellationToken = default) =>
        _db.Tickets.AddAsync(ticket, cancellationToken).AsTask();

    public void RemoveRange(IEnumerable<Ticket> tickets) => _db.Tickets.RemoveRange(tickets);
}
