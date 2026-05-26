using BusStation.API.DTOs.Routes;

namespace BusStation.API.Application.Services;

public interface IRouteService
{
    Task<IEnumerable<RouteResponse>> GetAllAsync(bool includeInactive, bool canViewInactive);
    Task<RouteResponse> CreateAsync(CreateRouteRequest request);
    Task<RouteResponse> UpdateAsync(int id, UpdateRouteRequest request);
}
