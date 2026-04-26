using System.ComponentModel.DataAnnotations;

namespace ServiceDesk.API.Domain;

public class Trip
{
    public int Id { get; set; }

    public int RouteId { get; set; }
    public BusRoute Route { get; set; } = null!;

    public DateTimeOffset DepartureTime { get; set; }

    public DateTimeOffset ArrivalTime { get; set; }

    public decimal Price { get; set; }

    [Range(1, 100)]
    public int TotalSeats { get; set; }

    [Range(0, 100)]
    public int FreeSeats { get; set; }

    public TripStatus Status { get; set; } = TripStatus.Scheduled;

    public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
}
