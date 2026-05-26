using System.ComponentModel.DataAnnotations;

namespace BusStation.API.DTOs.Users;

public record UpdateUserRoleRequest([Required] string Role);
