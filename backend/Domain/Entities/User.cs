using IntranetStarter.Domain.Common;

namespace IntranetStarter.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public bool IsActive { get; set; } = true;
    public string Role { get; set; } = "Employee";
    public string? Department { get; set; }
    public string? JobTitle { get; set; }
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    
    public string FullName => $"{FirstName} {LastName}";
}