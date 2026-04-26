using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ServiceDesk.API.Application.Mapping;
using ServiceDesk.API.DTOs.Tickets;
using ServiceDesk.API.Domain;
using ServiceDesk.API.Exceptions;
using ServiceDesk.API.Infrastructure.Data;

namespace ServiceDesk.API.Application.Services;

public class TicketService : ITicketService
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<TicketService> _logger;

    public TicketService(
        AppDbContext db,
        UserManager<ApplicationUser> userManager,
        ILogger<TicketService> logger)
    {
        _db = db;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<IEnumerable<TicketResponse>> GetMyAsync(string userId)
    {
        var tickets = await BaseQuery()
            .Where(ticket => ticket.UserId == userId)
            .OrderByDescending(ticket => ticket.BookedAt)
            .ToListAsync();

        return tickets.Select(ticket => ticket.ToResponse());
    }

    public async Task<TicketResponse> CreateAsync(CreateTicketRequest request, string userId)
    {
        var passengerName = (request.PassengerName ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(passengerName))
        {
            throw new BusinessException("Имя пассажира обязательно.");
        }

        var trip = await _db.Trips
            .Include(item => item.Route)
            .Include(item => item.Tickets)
            .FirstOrDefaultAsync(item => item.Id == request.TripId)
            ?? throw new NotFoundException("Рейс не найден.");

        if (!trip.Route.IsActive || trip.Status != TripStatus.Scheduled)
        {
            throw new BusinessException("Билет можно купить только на активный рейс.");
        }

        if (trip.DepartureTime <= DateTimeOffset.Now)
        {
            throw new BusinessException("Нельзя купить билет на уже прошедший рейс.");
        }

        if (trip.FreeSeats <= 0)
        {
            throw new BusinessException("Свободных мест больше нет.");
        }

        var hasDuplicatePassenger = trip.Tickets.Any(ticket =>
            ticket.Status == TicketStatus.Booked &&
            string.Equals(ticket.PassengerName.Trim(), passengerName, StringComparison.OrdinalIgnoreCase));

        if (hasDuplicatePassenger)
        {
            throw new BusinessException("На одно имя можно купить только один билет на этот рейс.");
        }

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Пользователь не найден.");

        var seatNumber = trip.Tickets
            .Where(ticket => ticket.Status == TicketStatus.Booked)
            .Select(ticket => ticket.SeatNumber)
            .DefaultIfEmpty(0)
            .Max() + 1;

        var ticket = new Ticket
        {
            TripId = trip.Id,
            UserId = user.Id,
            PassengerName = passengerName,
            SeatNumber = seatNumber,
            Price = trip.Price,
            BookedAt = DateTimeOffset.UtcNow,
            Status = TicketStatus.Booked
        };

        trip.FreeSeats -= 1;
        _db.Tickets.Add(ticket);

        await _db.SaveChangesAsync();

        _logger.LogInformation("Ticket {TicketId} created for trip {TripId}", ticket.Id, trip.Id);

        var created = await BaseQuery().FirstAsync(item => item.Id == ticket.Id);
        return created.ToResponse();
    }

    public async Task<SalesReportResponse> GetSalesReportAsync(DateOnly? dateFrom, DateOnly? dateTo, int? routeId)
    {
        var query = BaseQuery().Where(ticket => ticket.Status == TicketStatus.Booked);

        if (dateFrom.HasValue)
        {
            var from = dateFrom.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(ticket => ticket.BookedAt >= from);
        }

        if (dateTo.HasValue)
        {
            var to = dateTo.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(ticket => ticket.BookedAt <= to);
        }

        if (routeId.HasValue)
        {
            query = query.Where(ticket => ticket.Trip.RouteId == routeId.Value);
        }

        var items = await query
            .OrderByDescending(ticket => ticket.BookedAt)
            .ToListAsync();

        return new SalesReportResponse(
            items.Count,
            items.Sum(ticket => ticket.Price),
            items.Select(ticket => ticket.ToSalesResponse()));
    }

    private IQueryable<Ticket> BaseQuery() =>
        _db.Tickets
            .Include(ticket => ticket.User)
            .Include(ticket => ticket.Trip)
            .ThenInclude(trip => trip.Route)
            .AsNoTracking();
}
