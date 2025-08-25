# Authentication Guide

## Overview

The template uses **OAuth2/OIDC** authentication with support for Azure AD and Google OAuth providers. Authentication is handled via secure HTTP-only cookies with JWT tokens.

## Supported Providers

### Azure AD (Recommended for Enterprise)
Best for organizations already using Microsoft 365 or Azure services.

**Setup Steps:**
1. **Register Application** in Azure Portal:
   - Go to Azure Active Directory → App registrations
   - Click "New registration"
   - Set redirect URI: `http://localhost:5000/signin-oidc`

2. **Configure Application:**
   - Note down: `Application (client) ID` and `Directory (tenant) ID`
   - Generate client secret in "Certificates & secrets"
   - Add API permissions if needed

3. **Update Configuration:**
```env
# .env.development
JWT_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0
JWT_AUDIENCE=YOUR_CLIENT_ID
ALLOWED_DOMAIN=@yourcompany.com
ADMIN_EMAIL=admin@yourcompany.com
```

### Google OAuth
Good for organizations using Google Workspace or as an alternative provider.

**Setup Steps:**
1. **Create OAuth Client** in Google Cloud Console:
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Set authorized origins: `http://localhost:5000`
   - Set redirect URIs: `http://localhost:5000/signin-google`

2. **Update Configuration:**
```env
# .env.development
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
ALLOWED_DOMAIN=@yourcompany.com
ADMIN_EMAIL=admin@yourcompany.com
```

## Authentication Flow

### 1. User Authentication Process
```
1. User clicks "Login" button
2. Redirected to OAuth provider (Azure AD/Google)
3. User authenticates with provider
4. Provider redirects back with authorization code
5. Backend exchanges code for JWT access token
6. JWT stored in HTTP-only secure cookie
7. User redirected to dashboard
```

### 2. Request Authorization Process
```
1. Frontend makes API request
2. HTTP-only cookie automatically sent with request
3. Backend validates JWT token
4. User claims extracted from token
5. Role-based authorization applied
6. Request processed or rejected
```

## Role-Based Access Control (RBAC)

### Available Roles
- **Admin**: Full system access, user management
- **Manager**: Project management, team oversight  
- **Employee**: Basic access, assigned projects only

### Role Assignment
Roles are assigned based on:
1. **Admin Email**: User matching `ADMIN_EMAIL` gets Admin role
2. **Domain Restriction**: Users from `ALLOWED_DOMAIN` get Employee role by default
3. **Manual Assignment**: Admins can change user roles via UI

### Authorization in Backend
```csharp
// Controller-level authorization
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase { }

// Action-level authorization
[HttpPost]
[Authorize(Policy = "ManagerOrAdmin")]
public async Task<IActionResult> CreateProject() { }

// Custom authorization
[HttpGet]
[Authorize]
public async Task<IActionResult> GetMyProjects()
{
    // Only return user's own projects
}
```

### Authorization in Frontend
```typescript
// Component-level protection
const { user, hasRole } = useAuth();

if (!hasRole('Manager')) {
  return <UnauthorizedMessage />;
}

// Route-level protection
const ProtectedRoute = ({ children, requiredRole }) => {
  const { hasRole } = useAuth();
  return hasRole(requiredRole) ? children : <Navigate to="/unauthorized" />;
};
```

## Configuration Options

### Environment Variables
```env
# Required - OAuth Provider Settings
JWT_AUTHORITY=https://login.microsoftonline.com/tenant-id/v2.0
JWT_AUDIENCE=client-id
# OR
GOOGLE_CLIENT_ID=google-client-id
GOOGLE_CLIENT_SECRET=google-secret

# Security Settings
ALLOWED_DOMAIN=@yourcompany.com    # Restrict to company domain
ADMIN_EMAIL=admin@company.com       # Auto-assign admin role
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT Token Settings (Optional)
JWT_ISSUER=YourApp
JWT_EXPIRY_HOURS=24
```

### Backend Configuration (`appsettings.json`)
```json
{
  "Authentication": {
    "JwtBearer": {
      "Authority": "https://login.microsoftonline.com/tenant-id/v2.0",
      "Audience": "client-id",
      "RequireHttpsMetadata": false,
      "SaveToken": true
    },
    "Google": {
      "ClientId": "google-client-id",
      "ClientSecret": "google-secret"
    }
  },
  "Authorization": {
    "AllowedDomain": "@yourcompany.com",
    "AdminEmail": "admin@yourcompany.com",
    "AutoProvisionUsers": true
  }
}
```

## User Management

### User Provisioning
Users are automatically created on first login if:
- Email domain matches `ALLOWED_DOMAIN`
- OR user email matches `ADMIN_EMAIL`

### User Profile
Stored user information:
```typescript
interface User {
  id: number;
  email: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Employee';
  lastLoginAt: string;
  isActive: boolean;
}
```

### Managing Users (Admin Only)
```typescript
// Frontend: User management hooks
const { data: users } = useUsers();
const updateUserRole = useUpdateUserRole();

// Update user role
updateUserRole.mutate({ 
  userId: 123, 
  role: 'Manager' 
});
```

## Security Features

### Token Security
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: HTTPS-only in production
- **SameSite Policy**: CSRF protection
- **Short Expiry**: Tokens expire in 24 hours

### API Security
- **CORS Protection**: Only allowed origins can access API
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: All inputs validated server-side
- **SQL Injection Prevention**: Entity Framework parameterized queries

### Domain Restrictions
```csharp
// Only allow users from specific domains
if (!email.EndsWith(allowedDomain))
{
    throw new UnauthorizedAccessException("Domain not allowed");
}
```

## Testing Authentication

### Local Testing
```bash
# Test auth endpoints
curl http://localhost:5000/api/auth/profile

# Should return 401 if not authenticated
curl -H "Authorization: Bearer invalid-token" \
     http://localhost:5000/api/users
```

### Integration Testing
```csharp
[Test]
public async Task GetUsers_WithValidToken_ReturnsUsers()
{
    // Arrange
    var token = await GetValidJwtToken();
    _client.DefaultRequestHeaders.Authorization = 
        new AuthenticationHeaderValue("Bearer", token);

    // Act
    var response = await _client.GetAsync("/api/users");

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
}
```

## Common Issues & Solutions

### "Unauthorized" Errors
1. **Check token expiry**: Tokens expire after 24 hours
2. **Verify domain**: Email domain must match `ALLOWED_DOMAIN`
3. **Check role**: Ensure user has required role for endpoint

### OAuth Provider Issues
1. **Redirect URI mismatch**: Must exactly match configured URIs
2. **Client secret expired**: Generate new secret in provider console
3. **Tenant/Client ID wrong**: Double-check configuration

### Cookie Issues
1. **SameSite errors**: Check browser console for warnings
2. **Secure flag**: Must use HTTPS in production
3. **Domain mismatch**: Cookie domain must match request domain

## Customization

### Adding New OAuth Providers
1. **Install provider package**: e.g., `Microsoft.AspNetCore.Authentication.Facebook`
2. **Configure in Startup**: Add provider to authentication services
3. **Update frontend**: Add provider-specific login button
4. **Test integration**: Ensure proper token handling

### Custom Claims
```csharp
// Add custom claims during token validation
services.Configure<JwtBearerOptions>(options =>
{
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = context =>
        {
            var user = context.Principal;
            // Add custom claims
            var claims = new List<Claim>
            {
                new Claim("custom_claim", "custom_value")
            };
            
            var appIdentity = new ClaimsIdentity(claims);
            context.Principal.AddIdentity(appIdentity);
            return Task.CompletedTask;
        }
    };
});
```

### Multi-Tenant Support
For multi-tenant scenarios:
1. Extract tenant from JWT claims
2. Filter data by tenant ID
3. Configure separate OAuth apps per tenant

This authentication system provides enterprise-grade security while remaining flexible for various organizational needs.