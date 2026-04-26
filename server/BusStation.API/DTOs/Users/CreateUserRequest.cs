using System.ComponentModel.DataAnnotations;

namespace ServiceDesk.API.DTOs.Users;

public record CreateUserRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password,
    [Required, MinLength(2)] string DisplayName,
    [Required] string Role
);
