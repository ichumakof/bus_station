using System.ComponentModel.DataAnnotations;

namespace BusStation.API.DTOs.Auth;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);
