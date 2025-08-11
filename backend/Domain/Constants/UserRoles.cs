namespace IntranetStarter.Domain.Constants;

public static class UserRoles {
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Employee = "Employee";
    
    public static readonly string[] All = [Admin, Manager, Employee];
    
    public static bool IsValidRole(string role) {
        return All.Contains(role);
    }
}