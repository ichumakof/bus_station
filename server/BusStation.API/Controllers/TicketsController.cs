using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusStation.API.Application.Services;
using BusStation.API.DTOs.Tickets;

namespace BusStation.API.Controllers;

[ApiController]
[Route("api/tickets")]
[Authorize]
[Produces("application/json")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    /// <summary>Возвращает билеты, купленные текущим пассажиром.</summary>
    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(IEnumerable<TicketResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<TicketResponse>>> GetMy()
    {
        var userId = User.FindFirstValue("sub")!;
        return Ok(await _ticketService.GetMyAsync(userId));
    }

    /// <summary>Покупает билет на выбранный рейс.</summary>
    [HttpPost]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(typeof(TicketResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<TicketResponse>> Create([FromBody] CreateTicketRequest request)
    {
        var userId = User.FindFirstValue("sub")!;
        var result = await _ticketService.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetMy), new { id = result.Id }, result);
    }

    /// <summary>Возвращает отчет по продажам купленных билетов.</summary>
    [HttpGet("sales")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(SalesReportResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<SalesReportResponse>> GetSales(
        [FromQuery] DateOnly? dateFrom = null,
        [FromQuery] DateOnly? dateTo = null,
        [FromQuery] int? routeId = null)
    {
        return Ok(await _ticketService.GetSalesReportAsync(dateFrom, dateTo, routeId));
    }
}
