using System.ComponentModel.DataAnnotations;

namespace ServiceDesk.API.DTOs.Tickets;

public record CreateTicketRequest(
    [Range(1, int.MaxValue)] int TripId,
    [Required, MaxLength(100)] string PassengerName
);
