using ServiceDesk.API.Domain;

namespace ServiceDesk.API.Infrastructure.Auth;

public interface ITokenService
{
    string GenerateToken(ApplicationUser user, string role);
}
