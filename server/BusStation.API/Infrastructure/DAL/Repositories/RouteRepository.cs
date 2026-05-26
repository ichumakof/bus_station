using BusStation.API.Application.Abstractions.Repositories;
using BusStation.API.Domain;
using BusStation.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BusStation.API.Infrastructure.DAL.Repositories;

public class RouteRepository : IRouteRepository
{
    private readonly AppDbContext _db;

    public RouteRepository(AppDbContext db)
    {
        _db = db;
    }

    public IQueryable<BusRoute> Query() => _db.Routes.AsNoTracking();

    public Task<BusRoute?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _db.Routes.FirstOrDefaultAsync(route => route.Id == id, cancellationToken);

    public Task<bool> ExistsByCitiesAsync(
        string departureCity,
        string arrivalCity,
        int? excludeId = null,
        CancellationToken cancellationToken = default) =>
        _db.Routes.AnyAsync(
            route => route.DepartureCity == departureCity &&
                     route.ArrivalCity == arrivalCity &&
                     (!excludeId.HasValue || route.Id != excludeId.Value),
            cancellationToken);

    public Task AddAsync(BusRoute route, CancellationToken cancellationToken = default) =>
        _db.Routes.AddAsync(route, cancellationToken).AsTask();
}
