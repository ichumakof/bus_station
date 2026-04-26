using System.ComponentModel.DataAnnotations;

namespace ServiceDesk.API.DTOs.Users;

public record UpdateUserRoleRequest([Required] string Role);
