using BusStation.API.Domain;

namespace BusStation.API.Infrastructure.Auth;

public interface ITokenService
{
    string GenerateToken(ApplicationUser user, string role);
}
