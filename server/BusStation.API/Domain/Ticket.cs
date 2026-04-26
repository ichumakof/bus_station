using System.ComponentModel.DataAnnotations;

namespace ServiceDesk.API.Domain;

public class Ticket
{
    public int Id { get; set; }

    public int TripId { get; set; }
    public Trip Trip { get; set; } = null!;

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string PassengerName { get; set; } = string.Empty;

    public int SeatNumber { get; set; }

    public decimal Price { get; set; }

    public DateTimeOffset BookedAt { get; set; }

    public TicketStatus Status { get; set; } = TicketStatus.Booked;
}
