using Microsoft.EntityFrameworkCore;
using ServiceDesk.API.Application.Mapping;
using ServiceDesk.API.DTOs.Routes;
using ServiceDesk.API.Exceptions;
using ServiceDesk.API.Infrastructure.Data;
using ServiceDesk.API.Infrastructure.Seed;
using ServiceDesk.API.Domain;

namespace ServiceDesk.API.Application.Services;

public class RouteService : IRouteService
{
    private readonly AppDbContext _db;

    public RouteService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<RouteResponse>> GetAllAsync(bool includeInactive, bool canViewInactive)
    {
        IQueryable<BusRoute> query = _db.Routes.AsNoTracking();

        if (!canViewInactive || !includeInactive)
        {
            query = query.Where(route => route.IsActive);
        }

        var routes = await query
            .OrderBy(route => route.DepartureCity)
            .ThenBy(route => route.ArrivalCity)
            .ToListAsync();

        return routes.Select(route => route.ToResponse());
    }

    public async Task<RouteResponse> CreateAsync(CreateRouteRequest request)
    {
        var route = new BusRoute
        {
            DepartureCity = Normalize(request.DepartureCity),
            ArrivalCity = Normalize(request.ArrivalCity),
            TravelMinutes = request.TravelMinutes,
            IsActive = true
        };

        Validate(route);

        var exists = await _db.Routes.AnyAsync(r =>
            r.DepartureCity == route.DepartureCity &&
            r.ArrivalCity == route.ArrivalCity);
        if (exists)
        {
            throw new BusinessException("Такой маршрут уже существует.");
        }

        _db.Routes.Add(route);
        await _db.SaveChangesAsync();

        return route.ToResponse();
    }

    public async Task<RouteResponse> UpdateAsync(int id, UpdateRouteRequest request)
    {
        var route = await _db.Routes.FindAsync(id)
            ?? throw new NotFoundException("Маршрут не найден.");

        route.DepartureCity = Normalize(request.DepartureCity);
        route.ArrivalCity = Normalize(request.ArrivalCity);
        route.TravelMinutes = request.TravelMinutes;
        route.IsActive = request.IsActive;

        Validate(route);

        var exists = await _db.Routes.AnyAsync(r =>
            r.Id != route.Id &&
            r.DepartureCity == route.DepartureCity &&
            r.ArrivalCity == route.ArrivalCity);
        if (exists)
        {
            throw new BusinessException("Такой маршрут уже существует.");
        }

        await _db.SaveChangesAsync();
        return route.ToResponse();
    }

    private static string Normalize(string value) => (value ?? string.Empty).Trim();

    private static void Validate(BusRoute route)
    {
        if (string.IsNullOrWhiteSpace(route.DepartureCity) || string.IsNullOrWhiteSpace(route.ArrivalCity))
        {
            throw new BusinessException("Города отправления и прибытия обязательны.");
        }

        if (route.DepartureCity == route.ArrivalCity)
        {
            throw new BusinessException("Города отправления и прибытия не должны совпадать.");
        }

        if (!BusStationCatalog.AllowedCities.Contains(route.DepartureCity))
        {
            throw new BusinessException("Город отправления должен быть из утвержденного списка.");
        }
    }
}
