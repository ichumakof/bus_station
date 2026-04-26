using ServiceDesk.API.DTOs;
using ServiceDesk.API.DTOs.Trips;

namespace ServiceDesk.API.Application.Services;

public interface ITripService
{
    Task<PagedResponse<TripResponse>> GetAllAsync(TripsQuery query, string role);
    Task<TripResponse> GetByIdAsync(int id, string role);
    Task<TripResponse> CreateAsync(CreateTripRequest request);
    Task<TripResponse> UpdateAsync(int id, UpdateTripRequest request);
}
