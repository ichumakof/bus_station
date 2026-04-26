using System.ComponentModel.DataAnnotations;

namespace ServiceDesk.API.Domain;

public class BusRoute
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string DepartureCity { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ArrivalCity { get; set; } = string.Empty;

    public int TravelMinutes { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
}
