using BusStation.API.Domain;

namespace BusStation.API.Application.Abstractions.Repositories;

public interface IRouteRepository
{
    IQueryable<BusRoute> Query();
    Task<BusRoute?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCitiesAsync(
        string departureCity,
        string arrivalCity,
        int? excludeId = null,
        CancellationToken cancellationToken = default);
    Task AddAsync(BusRoute route, CancellationToken cancellationToken = default);
}
