using ServiceDesk.API.DTOs.Users;

namespace ServiceDesk.API.Application.Services;

public interface IUserAdminService
{
    Task<IEnumerable<UserResponse>> GetAllAsync();
    Task<UserResponse> CreateAsync(CreateUserRequest request);
    Task<UserResponse> UpdateRoleAsync(string userId, UpdateUserRoleRequest request);
    Task DeleteAsync(string userId, string currentUserId);
}
