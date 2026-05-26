using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusStation.API.Application.Services;
using BusStation.API.DTOs;
using BusStation.API.DTOs.Trips;

namespace BusStation.API.Controllers;

[ApiController]
[Route("api/trips")]
[Authorize]
[Produces("application/json")]
public class TripsController : ControllerBase
{
    private readonly ITripService _tripService;

    public TripsController(ITripService tripService)
    {
        _tripService = tripService;
    }

    /// <summary>Возвращает рейсы с фильтрацией и пагинацией.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<TripResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResponse<TripResponse>>> GetAll(
        [FromQuery] string? fromCity = null,
        [FromQuery] string? toCity = null,
        [FromQuery] DateOnly? date = null,
        [FromQuery] int? routeId = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        // Роль передается в сервис, чтобы скрыть от пассажира недоступные или неактивные рейсы.
        var role = User.FindFirstValue("role") ?? string.Empty;
        var query = new TripsQuery(fromCity, toCity, date, routeId, status, page, pageSize);
        return Ok(await _tripService.GetAllAsync(query, role));
    }

    /// <summary>Возвращает рейс по его идентификатору.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TripResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<TripResponse>> GetById(int id)
    {
        var role = User.FindFirstValue("role") ?? string.Empty;
        return Ok(await _tripService.GetByIdAsync(id, role));
    }

    /// <summary>Создает рейс. Доступно только оператору.</summary>
    [HttpPost]
    [Authorize(Roles = "Operator")]
    [ProducesResponseType(typeof(TripResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<TripResponse>> Create([FromBody] CreateTripRequest request)
    {
        var result = await _tripService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Обновляет рейс. Доступно только оператору.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Operator")]
    [ProducesResponseType(typeof(TripResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<TripResponse>> Update(int id, [FromBody] UpdateTripRequest request)
    {
        return Ok(await _tripService.UpdateAsync(id, request));
    }
}
