using BusStation.API.Domain;
using BusStation.API.DTOs.Users;

namespace BusStation.API.Application.Mapping;

public static class UserMapping
{
    public static UserResponse ToResponse(this ApplicationUser user, string role) =>
        new(user.Id, user.DisplayName, user.Email ?? string.Empty, role);
}
