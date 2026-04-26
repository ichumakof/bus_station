using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ServiceDesk.API.Application.Services;
using ServiceDesk.API.DTOs.Routes;

namespace ServiceDesk.API.Controllers;

[ApiController]
[Route("api/routes")]
[Authorize]
[Produces("application/json")]
public class RoutesController : ControllerBase
{
    private readonly IRouteService _routeService;

    public RoutesController(IRouteService routeService)
    {
        _routeService = routeService;
    }

    /// <summary>Возвращает маршруты автовокзала.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RouteResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<RouteResponse>>> GetAll([FromQuery] bool includeInactive = false)
    {
        var role = User.FindFirstValue("role") ?? string.Empty;
        var canViewInactive = role == "Operator" || role == "Admin";
        return Ok(await _routeService.GetAllAsync(includeInactive, canViewInactive));
    }

    /// <summary>Создает маршрут. Доступно оператору.</summary>
    [HttpPost]
    [Authorize(Roles = "Operator")]
    [ProducesResponseType(typeof(RouteResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<RouteResponse>> Create([FromBody] CreateRouteRequest request)
    {
        var result = await _routeService.CreateAsync(request);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    /// <summary>Изменяет маршрут. Доступно оператору.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Operator")]
    [ProducesResponseType(typeof(RouteResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RouteResponse>> Update(int id, [FromBody] UpdateRouteRequest request)
    {
        return Ok(await _routeService.UpdateAsync(id, request));
    }
}
