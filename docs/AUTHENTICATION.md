# Authentication Guide

## Overview
The Intranet Starter Project implements a robust, secure authentication system using OAuth2/OpenID Connect (OIDC) with multiple identity providers.

## Supported Authentication Providers
1. Azure Active Directory
2. Google Workspace
3. Local Development Identity (for testing)

## OAuth2/OIDC Flow
```
+-------------+                 +---------------+
|   User      |     Redirect    | Identity      |
|             | --------------> | Provider      |
+-------------+                 +-------+-------+
      ^                                 |
      |                                 |
      |         Authorization Code      |
      +---------------------------------+
```

### Authentication Steps
1. User initiates login
2. Redirected to chosen identity provider
3. Provider validates credentials
4. Returns authorization code
5. Backend exchanges code for access token
6. Token validated and user authenticated

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
- `Anonymous`: No access
- `User`: Basic access
- `Editor`: Content modification
- `Admin`: Full system access

### Role Assignment
Roles assigned based on:
- Group membership
- Directory attributes
- Custom claims

### RBAC Example
```csharp
[Authorize(Roles = "Admin")]
public IActionResult AdminDashboard() {
    // Only accessible by Admin role
}
```

## Token Management

### Access Token
- JWT format
- Short-lived (default 1 hour)
- Contains user claims

### Refresh Token
- Long-lived token
- Used to obtain new access tokens
- Securely stored server-side

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