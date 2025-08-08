# Authentication Guide

## Overview
The Intranet Starter Project implements a simplified, secure cookie-based authentication system using OAuth2/OpenID Connect (OIDC) with multiple identity providers.

## Supported Authentication Providers
1. Azure Active Directory
2. Google Workspace

## Simplified Cookie-Based Authentication Flow
```
+-------------+                 +---------------+
|   User      |     Redirect    | OAuth         |
|             | --------------> | Provider      |
+-------------+                 +-------+-------+
      ^                                 |
      |                                 |
      |     Session Cookie Created      |
      +---------------------------------+
```

### Authentication Steps
1. User initiates login via `/api/auth/login/google` or `/api/auth/login/azure`
2. Redirected to chosen OAuth provider
3. Provider validates credentials
4. OAuth callback creates server-side session
5. HTTP-only secure cookie sent to browser
6. All subsequent requests authenticated via session cookie

### Cookie Security Features
- HTTP-only flag prevents JavaScript access
- Secure flag ensures HTTPS-only transmission
- SameSite attribute prevents CSRF attacks
- Session expiration after inactivity

## Azure AD Configuration

### Prerequisites
- Azure AD tenant
- Registered application
- Client credentials

### Configuration Steps
1. Register Application in Azure Portal
   - Supported Account Types: Organizational
   - Redirect URI: `https://yourapp.com/callback`

2. Create Client Secret
   - Go to Certificates & Secrets
   - Generate new client secret

3. Update `appsettings.json`
```json
{
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "Domain": "yourdomain.onmicrosoft.com",
    "TenantId": "your-tenant-id",
    "ClientId": "your-client-id",
    "CallbackPath": "/signin-oidc"
  }
}
```

## Google OAuth Configuration

### Prerequisites
- Google Cloud Console project
- OAuth 2.0 Client ID
- Configured consent screen

### Configuration Steps
1. Create OAuth Client in Google Cloud Console
2. Add authorized redirect URIs
3. Generate client credentials

4. Update `appsettings.json`
```json
{
  "Google": {
    "ClientId": "your-client-id",
    "ClientSecret": "your-client-secret",
    "CallbackPath": "/signin-google"
  }
}
```

## Domain Restrictions

### Organizational Domain Validation
- Restrict login to specific domains
- Prevent external access

```csharp
services.AddAuthentication()
    .AddGoogle(options => {
        options.Events.OnTokenValidated = context => {
            var email = context.Principal.FindFirstValue(ClaimTypes.Email);
            if (!email.EndsWith("@yourcompany.com")) {
                context.Fail("Unauthorized domain");
            }
            return Task.CompletedTask;
        };
    });
```

## Role-Based Access Control (RBAC)

### Role Hierarchy
- `Employee`: Basic access to application features
- `Manager`: Extended access with management capabilities
- `Admin`: Full system access including user management

### Automatic Role Assignment
Roles are assigned based on:
- Email patterns configured in environment variables
- Pre-provisioned user settings
- ADMIN_EMAIL environment variable for automatic admin assignment
- Manual assignment by existing admins

### User Pre-provisioning
Admins can pre-provision users before they log in:
1. Create user account with email and role
2. Send invitation email
3. User logs in via OAuth and inherits pre-configured role
4. Profile automatically populated from OAuth provider

### RBAC Example
```csharp
[Authorize(Roles = "Admin")]
public IActionResult AdminDashboard() {
    // Only accessible by Admin role
}
```

## Session Management

### Cookie-Based Sessions
- Server-side session storage
- Session ID stored in HTTP-only cookie
- No client-side token management required
- Automatic session cleanup on logout

### Session Configuration
```csharp
services.AddSession(options => {
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});
```

## Security Recommendations
- Use HTTPS everywhere
- Implement multi-factor authentication
- Regular token rotation
- Monitor suspicious login attempts
- Implement account lockout policies

## Troubleshooting

### Common Issues
1. Incorrect redirect URI
2. Misconfigured client secrets
3. Domain restriction errors
4. Token validation failures

### Debugging
- Enable detailed logging
- Check identity provider logs
- Verify network connectivity

## Compliance
- GDPR compliant
- CCPA considerations
- SOC 2 authentication practices

## Best Practices
- Never store passwords
- Use strong, secure tokens
- Implement token revocation
- Regular security audits