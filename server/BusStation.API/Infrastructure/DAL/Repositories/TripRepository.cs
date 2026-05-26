using BusStation.API.Application.Abstractions.Repositories;
using BusStation.API.Domain;
using BusStation.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BusStation.API.Infrastructure.DAL.Repositories;

public class TripRepository : ITripRepository
{
    private readonly AppDbContext _db;

    public TripRepository(AppDbContext db)
    {
        _db = db;
    }

    public IQueryable<Trip> Query() =>
        // Для чтения сразу подгружается маршрут, чтобы сервисам не приходилось делать отдельный запрос.
        _db.Trips
            .Include(trip => trip.Route)
            .AsNoTracking();

    public Task<Trip?> GetByIdWithTicketsAsync(int id, CancellationToken cancellationToken = default) =>
        _db.Trips
            .Include(trip => trip.Tickets)
            .FirstOrDefaultAsync(trip => trip.Id == id, cancellationToken);

    public Task<Trip?> GetByIdWithRouteAndTicketsAsync(int id, CancellationToken cancellationToken = default) =>
        _db.Trips
            .Include(trip => trip.Route)
            .Include(trip => trip.Tickets)
            .FirstOrDefaultAsync(trip => trip.Id == id, cancellationToken);

    public Task<Dictionary<int, Trip>> GetByIdsAsync(
        IEnumerable<int> ids,
        CancellationToken cancellationToken = default)
    {
        var tripIds = ids.Distinct().ToList();
        return _db.Trips
            .Where(trip => tripIds.Contains(trip.Id))
            .ToDictionaryAsync(trip => trip.Id, cancellationToken);
    }

    public Task AddAsync(Trip trip, CancellationToken cancellationToken = default) =>
        _db.Trips.AddAsync(trip, cancellationToken).AsTask();
}
