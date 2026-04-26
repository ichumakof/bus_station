using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ServiceDesk.API.Domain;
using ServiceDesk.API.Infrastructure.Data;

namespace ServiceDesk.API.Infrastructure.Seed;

public static class DbInitializer
{
    private record SeedUser(string Email, string Password, string DisplayName, string Role);
    private record RouteSeed(string DepartureCity, string ArrivalCity, int TravelMinutes);

    private static readonly SeedUser[] Users =
    [
        new("admin@demo.com", "Admin123!", "Admin", "Admin"),
        new("operator1@demo.com", "Operator123!", "Operator One", "Operator"),
        new("customer1@demo.com", "Customer123!", "Customer One", "Customer"),
        new("customer2@demo.com", "Customer123!", "Customer Two", "Customer"),
        new("customer3@demo.com", "Customer123!", "Customer Three", "Customer"),
        new("customer4@demo.com", "Customer123!", "Customer Four", "Customer"),
        new("customer5@demo.com", "Customer123!", "Customer Five", "Customer"),
        new("customer6@demo.com", "Customer123!", "Customer Six", "Customer"),
        new("customer7@demo.com", "Customer123!", "Customer Seven", "Customer"),
    ];

    private static readonly RouteSeed[] RouteSeeds =
    [
        new("Иваново", "Кинешма", 90),
        new("Кинешма", "Иваново", 90),
        new("Иваново", "Шуя", 30),
        new("Шуя", "Иваново", 30),
        new("Иваново", "Юрьевец", 180),
        new("Юрьевец", "Иваново", 180),
        new("Иваново", "Вичуга", 60),
        new("Вичуга", "Иваново", 60),
        new("Иваново", "Родники", 60),
        new("Родники", "Иваново", 60),
    ];

    private static readonly Dictionary<string, int[]> TicketTargets = new()
    {
        ["Иваново-Шуя"] = [40, 16, 9, 22, 14, 11],
        ["Иваново-Кинешма"] = [28, 40, 12, 18, 10],
        ["Иваново-Юрьевец"] = [40, 11, 24, 15],
        ["Иваново-Вичуга"] = [20, 14, 40, 8, 17],
        ["Иваново-Родники"] = [17, 26, 13, 40, 6, 19],
    };

    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var db = services.GetRequiredService<AppDbContext>();
        var logger = services.GetRequiredService<ILogger<AppDbContext>>();

        await SeedUsersAsync(userManager, logger);
        await SeedRoutesAsync(db);
        await SeedTripsAsync(db);
        await SeedTicketsAsync(db, userManager);
    }

    private static async Task SeedUsersAsync(UserManager<ApplicationUser> userManager, ILogger logger)
    {
        foreach (var seed in Users)
        {
            var user = await userManager.FindByEmailAsync(seed.Email);

            if (user is null)
            {
                user = new ApplicationUser
                {
                    UserName = seed.Email,
                    Email = seed.Email,
                    DisplayName = seed.DisplayName
                };

                var result = await userManager.CreateAsync(user, seed.Password);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    logger.LogError("Failed to seed user {Email}: {Errors}", seed.Email, errors);
                    continue;
                }
            }

            if (!await userManager.IsInRoleAsync(user, seed.Role))
            {
                var roleResult = await userManager.AddToRoleAsync(user, seed.Role);
                if (!roleResult.Succeeded)
                {
                    var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                    logger.LogError("Failed to assign role {Role} to {Email}: {Errors}", seed.Role, seed.Email, errors);
                }
            }
        }
    }

    private static async Task SeedRoutesAsync(AppDbContext db)
    {
        var routes = await db.Routes.ToListAsync();
        var routeMap = routes.ToDictionary(route => $"{route.DepartureCity}-{route.ArrivalCity}");
        var changed = false;

        foreach (var seed in RouteSeeds)
        {
            var key = $"{seed.DepartureCity}-{seed.ArrivalCity}";
            if (routeMap.TryGetValue(key, out var existing))
            {
                if (existing.TravelMinutes != seed.TravelMinutes || !existing.IsActive)
                {
                    existing.TravelMinutes = seed.TravelMinutes;
                    existing.IsActive = true;
                    changed = true;
                }
            }
            else
            {
                db.Routes.Add(new BusRoute
                {
                    DepartureCity = seed.DepartureCity,
                    ArrivalCity = seed.ArrivalCity,
                    TravelMinutes = seed.TravelMinutes,
                    IsActive = true
                });
                changed = true;
            }
        }

        if (changed)
        {
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedTripsAsync(AppDbContext db)
    {
        var routes = await db.Routes.ToDictionaryAsync(route => $"{route.DepartureCity}-{route.ArrivalCity}");
        var existingTrips = await db.Trips.ToListAsync();
        var tripMap = existingTrips.ToDictionary(
            trip => BuildTripKey(trip.RouteId, trip.DepartureTime),
            trip => trip);

        var today = DateOnly.FromDateTime(DateTime.Today);
        var endDate = new DateOnly(today.Year, 5, 1);
        if (today > endDate)
        {
            endDate = today.AddDays(2);
        }

        var newTrips = new List<Trip>();

        for (var day = today; day <= endDate; day = day.AddDays(1))
        {
            AddTrips(newTrips, tripMap, routes["Иваново-Кинешма"], day, [7, 10, 13, 16, 19], 0, 650m);
            AddTrips(newTrips, tripMap, routes["Кинешма-Иваново"], day, [6, 9, 12, 15, 18], 30, 650m);

            AddEveryTwentyMinutes(newTrips, tripMap, routes["Иваново-Шуя"], day, new TimeOnly(6, 40), new TimeOnly(21, 40), 220m);
            AddEveryTwentyMinutes(newTrips, tripMap, routes["Шуя-Иваново"], day, new TimeOnly(7, 20), new TimeOnly(22, 20), 220m);

            AddTrips(newTrips, tripMap, routes["Иваново-Юрьевец"], day, [6, 12, 18], 0, 980m);
            AddTrips(newTrips, tripMap, routes["Юрьевец-Иваново"], day, [6, 11, 17], 30, 980m);

            AddTrips(newTrips, tripMap, routes["Иваново-Вичуга"], day, [7, 9, 12, 14, 17, 19], 10, 450m);
            AddTrips(newTrips, tripMap, routes["Вичуга-Иваново"], day, [6, 8, 11, 13, 16, 18], 40, 450m);

            AddTrips(newTrips, tripMap, routes["Иваново-Родники"], day, [6, 8, 10, 12, 14, 16, 18], 50, 360m);
            AddTrips(newTrips, tripMap, routes["Родники-Иваново"], day, [7, 9, 11, 13, 15, 17, 19], 0, 360m);
        }

        if (newTrips.Count > 0)
        {
            db.Trips.AddRange(newTrips);
            await db.SaveChangesAsync();
        }
    }

    private static async Task SeedTicketsAsync(AppDbContext db, UserManager<ApplicationUser> userManager)
    {
        var customers = new List<ApplicationUser>();
        foreach (var seed in Users.Where(user => user.Role == "Customer"))
        {
            var user = await userManager.FindByEmailAsync(seed.Email);
            if (user is not null)
            {
                customers.Add(user);
            }
        }

        if (customers.Count == 0)
        {
            return;
        }

        var now = DateTimeOffset.Now;
        var trips = (await db.Trips
            .Include(trip => trip.Route)
            .Include(trip => trip.Tickets)
            .Where(trip => trip.DepartureTime > now)
            .OrderBy(trip => trip.DepartureTime)
            .ToListAsync())
            .Where(trip => TicketTargets.ContainsKey($"{trip.Route.DepartureCity}-{trip.Route.ArrivalCity}"))
            .ToList();

        var customerIndex = 0;
        var changed = false;

        foreach (var target in TicketTargets)
        {
            var routeTrips = trips
                .Where(trip => $"{trip.Route.DepartureCity}-{trip.Route.ArrivalCity}" == target.Key)
                .OrderBy(trip => trip.DepartureTime)
                .Take(target.Value.Length)
                .ToList();

            for (var index = 0; index < routeTrips.Count; index++)
            {
                var trip = routeTrips[index];
                var desiredBookedSeats = Math.Min(trip.TotalSeats, target.Value[index]);
                var currentBookedSeats = trip.Tickets.Count(ticket => ticket.Status == TicketStatus.Booked);

                if (currentBookedSeats > desiredBookedSeats)
                {
                    trip.FreeSeats = Math.Max(0, trip.TotalSeats - currentBookedSeats);
                    continue;
                }

                var nextSeat = trip.Tickets
                    .Where(ticket => ticket.Status == TicketStatus.Booked)
                    .Select(ticket => ticket.SeatNumber)
                    .DefaultIfEmpty(0)
                    .Max() + 1;

                while (currentBookedSeats < desiredBookedSeats)
                {
                    var customer = customers[customerIndex % customers.Count];
                    customerIndex++;

                    db.Tickets.Add(new Ticket
                    {
                        TripId = trip.Id,
                        UserId = customer.Id,
                        PassengerName = customer.DisplayName,
                        SeatNumber = nextSeat,
                        Price = trip.Price,
                        BookedAt = trip.DepartureTime.AddHours(-(nextSeat % 18 + 3)),
                        Status = TicketStatus.Booked
                    });

                    nextSeat++;
                    currentBookedSeats++;
                    changed = true;
                }

                trip.FreeSeats = Math.Max(0, trip.TotalSeats - currentBookedSeats);
            }
        }

        if (changed)
        {
            await db.SaveChangesAsync();
        }
    }

    private static void AddTrips(
        List<Trip> newTrips,
        Dictionary<string, Trip> tripMap,
        BusRoute route,
        DateOnly day,
        int[] hours,
        int minutes,
        decimal price)
    {
        foreach (var hour in hours)
        {
            var departure = new DateTimeOffset(day.ToDateTime(new TimeOnly(hour, minutes)));
            AddTripIfMissing(newTrips, tripMap, route, departure, price);
        }
    }

    private static void AddEveryTwentyMinutes(
        List<Trip> newTrips,
        Dictionary<string, Trip> tripMap,
        BusRoute route,
        DateOnly day,
        TimeOnly start,
        TimeOnly end,
        decimal price)
    {
        for (var time = start; time <= end; time = time.AddMinutes(20))
        {
            var departure = new DateTimeOffset(day.ToDateTime(time));
            AddTripIfMissing(newTrips, tripMap, route, departure, price);
        }
    }

    private static void AddTripIfMissing(
        List<Trip> newTrips,
        Dictionary<string, Trip> tripMap,
        BusRoute route,
        DateTimeOffset departure,
        decimal price)
    {
        var key = BuildTripKey(route.Id, departure);
        if (tripMap.ContainsKey(key))
        {
            return;
        }

        var trip = new Trip
        {
            RouteId = route.Id,
            DepartureTime = departure,
            ArrivalTime = departure.AddMinutes(route.TravelMinutes),
            Price = price,
            TotalSeats = 40,
            FreeSeats = 40,
            Status = TripStatus.Scheduled
        };

        tripMap[key] = trip;
        newTrips.Add(trip);
    }

    private static string BuildTripKey(int routeId, DateTimeOffset departure) =>
        $"{routeId}:{departure.UtcDateTime.Ticks}";
}
