using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BusStation.API.Application.Services;
using BusStation.API.DTOs.Users;

namespace BusStation.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IUserAdminService _userAdminService;

    public UsersController(IUserAdminService userAdminService)
    {
        _userAdminService = userAdminService;
    }

    /// <summary>Возвращает всех пользователей вместе с их текущими ролями.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetAll()
    {
        return Ok(await _userAdminService.GetAllAsync());
    }

    /// <summary>Создает пользователя с выбранной ролью.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<UserResponse>> Create([FromBody] CreateUserRequest request)
    {
        var result = await _userAdminService.CreateAsync(request);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    /// <summary>Обновляет роль, назначенную пользователю.</summary>
    [HttpPut("{id}/role")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserResponse>> UpdateRole(string id, [FromBody] UpdateUserRoleRequest request)
    {
        return Ok(await _userAdminService.UpdateRoleAsync(id, request));
    }

    /// <summary>Удаляет пользователя и связанные с ним билеты.</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Delete(string id)
    {
        var currentUserId = User.FindFirstValue("sub")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? string.Empty;

        await _userAdminService.DeleteAsync(id, currentUserId);
        return NoContent();
    }
}
