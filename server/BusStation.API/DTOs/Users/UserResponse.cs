namespace ServiceDesk.API.DTOs.Users;

public record UserResponse(
    string Id,
    string DisplayName,
    string Email,
    string Role
);
