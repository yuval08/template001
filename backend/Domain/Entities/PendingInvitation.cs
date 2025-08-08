using IntranetStarter.Domain.Common;

namespace IntranetStarter.Domain.Entities;

public class PendingInvitation : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string IntendedRole { get; set; } = "Employee";
    public Guid InvitedById { get; set; }
    public DateTime InvitedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; } = false;
    public DateTime? UsedAt { get; set; }

    // Navigation properties
    public User InvitedBy { get; set; } = null!;
}