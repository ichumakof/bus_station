using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ServiceDesk.API.Domain;

namespace ServiceDesk.API.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<BusRoute> Routes => Set<BusRoute>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<Ticket> Tickets => Set<Ticket>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<BusRoute>(e =>
        {
            e.HasKey(route => route.Id);
            e.Property(route => route.DepartureCity).IsRequired().HasMaxLength(50);
            e.Property(route => route.ArrivalCity).IsRequired().HasMaxLength(50);
            e.HasIndex(route => new { route.DepartureCity, route.ArrivalCity }).IsUnique();
        });

        builder.Entity<Trip>(e =>
        {
            e.HasKey(trip => trip.Id);
            e.Property(trip => trip.Price).HasPrecision(10, 2);
            e.HasOne(trip => trip.Route)
                .WithMany(route => route.Trips)
                .HasForeignKey(trip => trip.RouteId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(trip => trip.DepartureTime);
            e.HasIndex(trip => trip.Status);
        });

        builder.Entity<Ticket>(e =>
        {
            e.HasKey(ticket => ticket.Id);
            e.Property(ticket => ticket.PassengerName).IsRequired().HasMaxLength(100);
            e.Property(ticket => ticket.Price).HasPrecision(10, 2);
            e.HasOne(ticket => ticket.Trip)
                .WithMany(trip => trip.Tickets)
                .HasForeignKey(ticket => ticket.TripId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(ticket => ticket.User)
                .WithMany()
                .HasForeignKey(ticket => ticket.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(ticket => ticket.UserId);
            e.HasIndex(ticket => ticket.BookedAt);
        });
    }
}
