using BusStation.API.Application.Abstractions;
using BusStation.API.Application.Abstractions.Repositories;
using BusStation.API.Application.Mapping;
using BusStation.API.Domain;
using BusStation.API.DTOs.Routes;
using BusStation.API.Exceptions;
using BusStation.API.Infrastructure.Seed;
using Microsoft.EntityFrameworkCore;

namespace BusStation.API.Application.Services;

public class RouteService : IRouteService
{
    private readonly IRouteRepository _routeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RouteService(IRouteRepository routeRepository, IUnitOfWork unitOfWork)
    {
        _routeRepository = routeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<RouteResponse>> GetAllAsync(bool includeInactive, bool canViewInactive)
    {
        IQueryable<BusRoute> query = _routeRepository.Query();

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

        var exists = await _routeRepository.ExistsByCitiesAsync(route.DepartureCity, route.ArrivalCity);
        if (exists)
        {
            throw new BusinessException("Такой маршрут уже существует.");
        }

        await _routeRepository.AddAsync(route);
        await _unitOfWork.SaveChangesAsync();

        return route.ToResponse();
    }

    public async Task<RouteResponse> UpdateAsync(int id, UpdateRouteRequest request)
    {
        var route = await _routeRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Маршрут не найден.");

        route.DepartureCity = Normalize(request.DepartureCity);
        route.ArrivalCity = Normalize(request.ArrivalCity);
        route.TravelMinutes = request.TravelMinutes;
        route.IsActive = request.IsActive;

        Validate(route);

        var exists = await _routeRepository.ExistsByCitiesAsync(
            route.DepartureCity,
            route.ArrivalCity,
            route.Id);
        if (exists)
        {
            throw new BusinessException("Такой маршрут уже существует.");
        }

        await _unitOfWork.SaveChangesAsync();
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
