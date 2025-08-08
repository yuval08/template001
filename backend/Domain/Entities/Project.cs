using IntranetStarter.Domain.Common;

namespace IntranetStarter.Domain.Entities;

public class Project : BaseEntity {
    public string        Name        { get; set; } = string.Empty;
    public string        Description { get; set; } = string.Empty;
    public string?       ImageUrl    { get; set; }
    public DateTime?     StartDate   { get; set; }
    public DateTime?     EndDate     { get; set; }
    public ProjectStatus Status      { get; set; } = ProjectStatus.Planning;
    public decimal       Budget      { get; set; }
    public string?       ClientName  { get; set; }
    public string?       Tags        { get; set; }
    public int           Priority    { get; set; } = 1;

    // Foreign Keys
    public Guid? OwnerId { get; set; }

    // Navigation Properties
    public User?             Owner       { get; set; }
    public ICollection<User> TeamMembers { get; set; } = new List<User>();
}

public enum ProjectStatus {
    Planning   = 1,
    InProgress = 2,
    OnHold     = 3,
    Completed  = 4,
    Cancelled  = 5
}