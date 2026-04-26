using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ServiceDesk.API.Application.Mapping;
using ServiceDesk.API.Domain;
using ServiceDesk.API.DTOs.Users;
using ServiceDesk.API.Exceptions;
using ServiceDesk.API.Infrastructure.Data;

namespace ServiceDesk.API.Application.Services;

public class UserAdminService : IUserAdminService
{
    private static readonly HashSet<string> ValidRoles = ["Customer", "Operator", "Admin"];

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _db;

    public UserAdminService(UserManager<ApplicationUser> userManager, AppDbContext db)
    {
        _userManager = userManager;
        _db = db;
    }

    public async Task<IEnumerable<UserResponse>> GetAllAsync()
    {
        var users = _userManager.Users.OrderBy(user => user.Email).ToList();
        var result = new List<UserResponse>(users.Count);

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(user.ToResponse(roles.FirstOrDefault() ?? string.Empty));
        }

        return result;
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        var requestedRole = NormalizeRole(request.Role);

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            throw new BusinessException("Пользователь с таким email уже существует.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName.Trim()
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            throw new BusinessException(string.Join("; ", createResult.Errors.Select(error => error.Description)));
        }

        var roleResult = await _userManager.AddToRoleAsync(user, requestedRole);
        if (!roleResult.Succeeded)
        {
            throw new BusinessException(string.Join("; ", roleResult.Errors.Select(error => error.Description)));
        }

        return user.ToResponse(requestedRole);
    }

    public async Task<UserResponse> UpdateRoleAsync(string userId, UpdateUserRoleRequest request)
    {
        var requestedRole = NormalizeRole(request.Role);

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new NotFoundException("Пользователь не найден.");

        var currentRoles = await _userManager.GetRolesAsync(user);
        var rolesToRemove = currentRoles.Where(role => role != requestedRole).ToList();

        if (!currentRoles.Contains(requestedRole))
        {
            var addResult = await _userManager.AddToRoleAsync(user, requestedRole);
            if (!addResult.Succeeded)
            {
                throw new BusinessException(string.Join("; ", addResult.Errors.Select(error => error.Description)));
            }
        }

        if (rolesToRemove.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
            if (!removeResult.Succeeded)
            {
                throw new BusinessException(string.Join("; ", removeResult.Errors.Select(error => error.Description)));
            }
        }

        return user.ToResponse(requestedRole);
    }

    public async Task DeleteAsync(string userId, string currentUserId)
    {
        if (userId == currentUserId)
        {
            throw new BusinessException("Нельзя удалить текущего администратора.");
        }

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new NotFoundException("Пользователь не найден.");

        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Contains("Admin"))
        {
            var adminCount = await CountAdminsAsync();
            if (adminCount <= 1)
            {
                throw new BusinessException("Нельзя удалить последнего администратора.");
            }
        }

        await using var transaction = await _db.Database.BeginTransactionAsync();

        var tickets = await _db.Tickets
            .Where(ticket => ticket.UserId == userId)
            .ToListAsync();

        if (tickets.Count > 0)
        {
            var bookedByTrip = tickets
                .Where(ticket => ticket.Status == TicketStatus.Booked)
                .GroupBy(ticket => ticket.TripId)
                .ToDictionary(group => group.Key, group => group.Count());

            if (bookedByTrip.Count > 0)
            {
                var tripIds = bookedByTrip.Keys.ToList();
                var trips = await _db.Trips
                    .Where(trip => tripIds.Contains(trip.Id))
                    .ToDictionaryAsync(trip => trip.Id);

                foreach (var pair in bookedByTrip)
                {
                    if (trips.TryGetValue(pair.Key, out var trip))
                    {
                        trip.FreeSeats = Math.Min(trip.TotalSeats, trip.FreeSeats + pair.Value);
                    }
                }
            }

            _db.Tickets.RemoveRange(tickets);
            await _db.SaveChangesAsync();
        }

        if (currentRoles.Count > 0)
        {
            var removeRolesResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeRolesResult.Succeeded)
            {
                throw new BusinessException(string.Join("; ", removeRolesResult.Errors.Select(error => error.Description)));
            }
        }

        var deleteResult = await _userManager.DeleteAsync(user);
        if (!deleteResult.Succeeded)
        {
            throw new BusinessException(string.Join("; ", deleteResult.Errors.Select(error => error.Description)));
        }

        await transaction.CommitAsync();
    }

    private async Task<int> CountAdminsAsync()
    {
        var users = await _userManager.Users.ToListAsync();
        var count = 0;

        foreach (var user in users)
        {
            if (await _userManager.IsInRoleAsync(user, "Admin"))
            {
                count++;
            }
        }

        return count;
    }

    private static string NormalizeRole(string role)
    {
        var requestedRole = (role ?? string.Empty).Trim();
        if (!ValidRoles.Contains(requestedRole))
        {
            throw new BusinessException("Роль должна быть Customer, Operator или Admin.");
        }

        return requestedRole;
    }
}
