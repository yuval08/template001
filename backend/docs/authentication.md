# Authentication & Authorization

## Authentication & Getting Current User

The application uses cookie-based OAuth authentication. To get the current authenticated user in controllers:

```csharp
// IMPORTANT: User ID is NOT directly available in claims
// You must look up the user by email from the database

private async Task<Guid?> GetUserIdAsync() {
    // Get user email from claims
    string? email = User.FindFirst(ClaimTypes.Email)?.Value;
    
    if (string.IsNullOrEmpty(email)) {
        logger.LogWarning("User authenticated but email claim is missing");
        return null;
    }
    
    // Look up user in database by email to get their ID
    var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
    
    if (user == null) {
        logger.LogWarning("User {Email} authenticated but not found in database", email);
        return null;
    }
    
    return user.Id;
}
```

## Available Claims

- `ClaimTypes.Email` - User's email address (always available)
- `ClaimTypes.Name` - User's display name
- `ClaimTypes.Role` - User's role (Admin, Manager, Employee)

## Getting User Information

```csharp
// Get email directly from claims
string? email = User.FindFirst(ClaimTypes.Email)?.Value;

// Get role from claims
string? role = User.FindFirst(ClaimTypes.Role)?.Value;
bool isAdmin = User.IsInRole("Admin");

// For user ID, always look up from database using email
var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);
Guid userId = user.Id;
```

## Authentication System Features

- Simplified cookie-based OAuth2/OIDC integration with Azure AD and Google
- Session-based authentication with HTTP-only secure cookies
- Role-based authorization policies: AdminOnly, ManagerOrAdmin, AllUsers
- Domain restriction support via ALLOWED_DOMAIN environment variable
- User pre-provisioning with role assignment
- Automatic admin creation based on ADMIN_EMAIL environment variable
- Custom claims added during token validation

## Required Configuration

Environment variables for authentication:
- `JWT_AUTHORITY`, `JWT_AUDIENCE` - Authentication settings
- `ADMIN_EMAIL`, `ALLOWED_DOMAIN` - Admin and domain restrictions

## Best Practices

✅ **DO** get user email from claims and look up the user in the database
❌ **DON'T** try to get user ID from claims (ClaimTypes.NameIdentifier, "sub", "id")