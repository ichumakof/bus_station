using Microsoft.AspNetCore.Identity;

namespace ServiceDesk.API.Domain;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
}
