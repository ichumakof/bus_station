using ServiceDesk.API.Domain;
using ServiceDesk.API.DTOs.Users;

namespace ServiceDesk.API.Application.Mapping;

public static class UserMapping
{
    public static UserResponse ToResponse(this ApplicationUser user, string role) =>
        new(user.Id, user.DisplayName, user.Email ?? string.Empty, role);
}
