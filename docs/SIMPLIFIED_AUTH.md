# Simplified Authentication System

This project now uses a simplified cookie-based OAuth authentication system inspired by the working ezy_backend_server example. This replaces the previous complex OIDC/JWT token system.

## How It Works

### Backend (Cookie-Based OAuth)
- Uses standard OAuth2 flows with Google and Microsoft/Azure AD
- Sessions are managed via HTTP-only secure cookies
- No complex JWT token management or OIDC client setup needed
- Authentication state is maintained server-side

### Frontend (Simple Fetch API)
- Uses simple fetch requests with `credentials: 'include'` for cookie handling
- No complex token storage, renewal, or management
- Authentication check via `/api/auth/me` endpoint
- Login redirects directly to OAuth provider

## Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Set authorized redirect URIs:
   - `http://localhost:5001/signin-google` (development)
   - `https://your-domain.com/signin-google` (production)
5. Add credentials to `.env`:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Microsoft/Azure AD Setup
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to App registrations → New registration
3. Set redirect URI: 
   - `http://localhost:5001/signin-microsoft` (development)
   - `https://your-domain.com/signin-microsoft` (production)
4. Create client secret in Certificates & secrets
5. Add credentials to `.env`:
```
AZURE_AD_CLIENT_ID=your-application-id
AZURE_AD_CLIENT_SECRET=your-client-secret
AZURE_AD_TENANT_ID=your-tenant-id-or-common
```

## API Endpoints

### Authentication Endpoints
- `GET /api/auth/login?provider=google` - Start Google OAuth flow
- `GET /api/auth/login?provider=microsoft` - Start Microsoft OAuth flow
- `GET /api/auth/login/google` - Start Google OAuth flow (direct)
- `GET /api/auth/login/microsoft` - Start Microsoft OAuth flow (direct)
- `POST /api/auth/logout` - Logout user and clear session
- `GET /api/auth/me` - Get current authenticated user info
- `GET /api/auth/config` - Get authentication configuration

### OAuth Callback Endpoints (automatic)
- `GET /signin-google` - Google OAuth callback (handled by middleware)
- `GET /signin-microsoft` - Microsoft OAuth callback (handled by middleware)

## Frontend Usage

### Login Component
```typescript
const { login, authConfig } = useAuth();

// Login with Google
await login('google');

// Login with Microsoft
await login('microsoft');
```

### Check Authentication
```typescript
const { user, isAuthenticated, checkAuth } = useAuth();

// Check if user is authenticated
if (isAuthenticated) {
  console.log('User:', user);
}

// Manually refresh auth state
await checkAuth();
```

### Logout
```typescript
const { signOut } = useAuth();
await signOut(); // Redirects to home page
```

## Key Benefits

1. **Simplicity**: No complex token management or OIDC configuration
2. **Security**: HTTP-only cookies prevent XSS attacks
3. **Reliability**: Standard OAuth flows with automatic session handling  
4. **Maintainability**: Much less code and complexity to maintain
5. **Flexibility**: Easy to add new OAuth providers following the same pattern

## Domain Restrictions

Set `ALLOWED_DOMAIN` environment variable to restrict login to specific domains:
```
ALLOWED_DOMAIN=yourcompany.com
```

This ensures only users with `@yourcompany.com` emails can authenticate.