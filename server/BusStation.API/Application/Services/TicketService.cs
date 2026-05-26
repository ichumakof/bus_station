using BusStation.API.Application.Abstractions;
using BusStation.API.Application.Abstractions.Repositories;
using BusStation.API.Application.Mapping;
using BusStation.API.Domain;
using BusStation.API.DTOs.Tickets;
using BusStation.API.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace BusStation.API.Application.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly ITripRepository _tripRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TicketService> _logger;

    public TicketService(
        ITicketRepository ticketRepository,
        ITripRepository tripRepository,
        UserManager<ApplicationUser> userManager,
        IUnitOfWork unitOfWork,
        ILogger<TicketService> logger)
    {
        _ticketRepository = ticketRepository;
        _tripRepository = tripRepository;
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<IEnumerable<TicketResponse>> GetMyAsync(string userId)
    {
        // Клиент видит свои билеты в обратном хронологическом порядке.
        var tickets = await _ticketRepository.Query()
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

        // Рейс загружается вместе с билетами, потому что число мест и дубликаты проверяются как бизнес-правила.
        var trip = await _tripRepository.GetByIdWithRouteAndTicketsAsync(request.TripId)
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

        // На одно имя нельзя оформить два активных билета на один и тот же рейс.
        var hasDuplicatePassenger = trip.Tickets.Any(ticket =>
            ticket.Status == TicketStatus.Booked &&
            string.Equals(ticket.PassengerName.Trim(), passengerName, StringComparison.OrdinalIgnoreCase));

        if (hasDuplicatePassenger)
        {
            throw new BusinessException("На одно имя можно купить только один билет на этот рейс.");
        }

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new BusinessException("Пользователь не найден.");

        // Номер места назначается следующим после уже занятых мест на этом рейсе.
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
        await _ticketRepository.AddAsync(ticket);
        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("Ticket {TicketId} created for trip {TripId}", ticket.Id, trip.Id);

        var created = await _ticketRepository.GetByIdAsync(ticket.Id)
            ?? throw new NotFoundException("Билет не найден.");
        return created.ToResponse();
    }

    public async Task<SalesReportResponse> GetSalesReportAsync(DateOnly? dateFrom, DateOnly? dateTo, int? routeId)
    {
        // Отчет строится только по купленным билетам и затем сужается дополнительными фильтрами.
        var query = _ticketRepository.Query().Where(ticket => ticket.Status == TicketStatus.Booked);

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
}
