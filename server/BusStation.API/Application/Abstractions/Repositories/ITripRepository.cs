using BusStation.API.Domain;

namespace BusStation.API.Application.Abstractions.Repositories;

public interface ITripRepository
{
    IQueryable<Trip> Query();
    Task<Trip?> GetByIdWithTicketsAsync(int id, CancellationToken cancellationToken = default);
    Task<Trip?> GetByIdWithRouteAndTicketsAsync(int id, CancellationToken cancellationToken = default);
    Task<Dictionary<int, Trip>> GetByIdsAsync(IEnumerable<int> ids, CancellationToken cancellationToken = default);
    Task AddAsync(Trip trip, CancellationToken cancellationToken = default);
}
