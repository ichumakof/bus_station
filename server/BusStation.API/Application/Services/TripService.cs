using BusStation.API.Application.Abstractions;
using BusStation.API.Application.Abstractions.Repositories;
using BusStation.API.Application.Mapping;
using BusStation.API.Domain;
using BusStation.API.DTOs;
using BusStation.API.DTOs.Trips;
using BusStation.API.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace BusStation.API.Application.Services;

public class TripService : ITripService
{
    private readonly ITripRepository _tripRepository;
    private readonly IRouteRepository _routeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public TripService(
        ITripRepository tripRepository,
        IRouteRepository routeRepository,
        IUnitOfWork unitOfWork)
    {
        _tripRepository = tripRepository;
        _routeRepository = routeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResponse<TripResponse>> GetAllAsync(TripsQuery query, string role)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        var now = DateTimeOffset.Now;

        var trips = _tripRepository.Query();

        // Пассажиру показываются только активные будущие рейсы, доступные для покупки.
        if (role == "Customer")
        {
            trips = trips.Where(trip =>
                trip.Route.IsActive &&
                trip.Status == TripStatus.Scheduled &&
                trip.DepartureTime > now);
        }

        if (!string.IsNullOrWhiteSpace(query.FromCity))
        {
            trips = trips.Where(trip => trip.Route.DepartureCity == query.FromCity);
        }

        if (!string.IsNullOrWhiteSpace(query.ToCity))
        {
            trips = trips.Where(trip => trip.Route.ArrivalCity == query.ToCity);
        }

        if (query.Date.HasValue)
        {
            var start = query.Date.Value.ToDateTime(TimeOnly.MinValue);
            var end = query.Date.Value.ToDateTime(TimeOnly.MaxValue);
            trips = trips.Where(trip => trip.DepartureTime >= start && trip.DepartureTime <= end);
        }

        if (query.RouteId.HasValue)
        {
            trips = trips.Where(trip => trip.RouteId == query.RouteId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Status) &&
            Enum.TryParse<TripStatus>(query.Status, true, out var status))
        {
            trips = trips.Where(trip => trip.Status == status);
        }

        var total = await trips.CountAsync();
        var items = await trips
            .OrderBy(trip => trip.DepartureTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResponse<TripResponse>(items.Select(trip => trip.ToResponse()), page, pageSize, total);
    }

    public async Task<TripResponse> GetByIdAsync(int id, string role)
    {
        var trip = await _tripRepository.Query().FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new NotFoundException("Рейс не найден.");

        if (role == "Customer" &&
            (!trip.Route.IsActive || trip.Status != TripStatus.Scheduled || trip.DepartureTime <= DateTimeOffset.Now))
        {
            throw new NotFoundException("Рейс не найден.");
        }

        return trip.ToResponse();
    }

    public async Task<TripResponse> CreateAsync(CreateTripRequest request)
    {
        var route = await _routeRepository.GetByIdAsync(request.RouteId)
            ?? throw new BusinessException("Маршрут не найден.");

        if (!Enum.TryParse<TripStatus>(request.Status, true, out var status))
        {
            throw new BusinessException("Некорректный статус рейса.");
        }

        var trip = new Trip
        {
            RouteId = route.Id,
            DepartureTime = request.DepartureTime,
            ArrivalTime = request.DepartureTime.AddMinutes(route.TravelMinutes),
            Price = request.Price,
            TotalSeats = request.TotalSeats,
            FreeSeats = request.TotalSeats,
            Status = status
        };

        await _tripRepository.AddAsync(trip);
        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(trip.Id, "Operator");
    }

    public async Task<TripResponse> UpdateAsync(int id, UpdateTripRequest request)
    {
        var trip = await _tripRepository.GetByIdWithTicketsAsync(id)
            ?? throw new NotFoundException("Рейс не найден.");

        var route = await _routeRepository.GetByIdAsync(request.RouteId)
            ?? throw new BusinessException("Маршрут не найден.");

        if (!Enum.TryParse<TripStatus>(request.Status, true, out var status))
        {
            throw new BusinessException("Некорректный статус рейса.");
        }

        // Оператор не может уменьшить общее число мест ниже количества уже проданных билетов.
        var bookedCount = trip.Tickets.Count(ticket => ticket.Status == TicketStatus.Booked);
        if (request.TotalSeats < bookedCount)
        {
            throw new BusinessException("Нельзя установить мест меньше, чем уже продано билетов.");
        }

        trip.RouteId = route.Id;
        trip.DepartureTime = request.DepartureTime;
        trip.ArrivalTime = request.DepartureTime.AddMinutes(route.TravelMinutes);
        trip.Price = request.Price;
        trip.TotalSeats = request.TotalSeats;
        trip.FreeSeats = request.TotalSeats - bookedCount;
        trip.Status = status;

        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(trip.Id, "Operator");
    }
}
