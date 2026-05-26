using BusStation.API.DTOs.Auth;

namespace BusStation.API.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<MeResponse> GetMeAsync(string userId);
}
