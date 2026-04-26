using Microsoft.EntityFrameworkCore;
using ServiceDesk.API.Application.Mapping;
using ServiceDesk.API.DTOs;
using ServiceDesk.API.DTOs.Trips;
using ServiceDesk.API.Domain;
using ServiceDesk.API.Exceptions;
using ServiceDesk.API.Infrastructure.Data;

namespace ServiceDesk.API.Application.Services;

public class TripService : ITripService
{
    private readonly AppDbContext _db;

    public TripService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResponse<TripResponse>> GetAllAsync(TripsQuery query, string role)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        var now = DateTimeOffset.Now;

        var trips = BaseQuery();

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
        var trip = await BaseQuery().FirstOrDefaultAsync(t => t.Id == id)
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
        var route = await _db.Routes.FirstOrDefaultAsync(route => route.Id == request.RouteId)
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

        _db.Trips.Add(trip);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(trip.Id, "Operator");
    }

    public async Task<TripResponse> UpdateAsync(int id, UpdateTripRequest request)
    {
        var trip = await _db.Trips
            .Include(item => item.Tickets)
            .FirstOrDefaultAsync(item => item.Id == id)
            ?? throw new NotFoundException("Рейс не найден.");

        var route = await _db.Routes.FirstOrDefaultAsync(item => item.Id == request.RouteId)
            ?? throw new BusinessException("Маршрут не найден.");

        if (!Enum.TryParse<TripStatus>(request.Status, true, out var status))
        {
            throw new BusinessException("Некорректный статус рейса.");
        }

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

        await _db.SaveChangesAsync();

        return await GetByIdAsync(trip.Id, "Operator");
    }

    private IQueryable<Trip> BaseQuery() =>
        _db.Trips
            .Include(trip => trip.Route)
            .AsNoTracking();
}
