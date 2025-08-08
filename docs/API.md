# API Documentation

## Overview
This document provides comprehensive details about the Intranet Starter Project's API endpoints, authentication requirements, and usage guidelines.

## Base URL
```
https://api.yourcompany.com/api/v1
```

## Authentication
The API uses cookie-based authentication with OAuth2 providers.

### Authentication Methods
1. OAuth2 with Azure AD (cookie-based)
2. OAuth2 with Google (cookie-based)
3. Session cookies with HTTP-only secure flags

### Authentication Flow
1. User initiates login via `/api/auth/login/google` or `/api/auth/login/azure`
2. OAuth provider handles authentication
3. Successful auth creates a session cookie
4. All subsequent requests use the session cookie for authentication

## API Endpoints

### Authentication

#### Get Current User
- **Endpoint**: `/auth/me`
- **Method**: GET
- **Description**: Retrieve current authenticated user's information
- **Response**:
```json
{
  "id": "uuid",
  "email": "john.doe@company.com",
  "name": "John Doe",
  "role": "Admin",
  "department": "IT",
  "jobTitle": "Senior Developer",
  "isActive": true
}
```

#### Logout
- **Endpoint**: `/auth/logout`
- **Method**: POST
- **Description**: Logout and clear authentication session

### User Management

#### List Users
- **Endpoint**: `/users`
- **Method**: GET
- **Permissions**: Admin only
- **Query Parameters**:
  - `pageNumber`: Page number (default: 1)
  - `pageSize`: Items per page (default: 10, max: 100)
  - `searchTerm`: Search by email, name, department, or job title
  - `roleFilter`: Filter by role (Admin, Manager, Employee)
  - `isActiveFilter`: Filter by active status

#### Get User by ID
- **Endpoint**: `/users/{id}`
- **Method**: GET
- **Permissions**: Admin only
- **Description**: Get detailed user information

#### Create/Pre-provision User
- **Endpoint**: `/users`
- **Method**: POST
- **Permissions**: Admin only
- **Request Body**:
```json
{
  "email": "newuser@company.com",
  "name": "New User",
  "role": "Employee",
  "department": "Sales",
  "jobTitle": "Sales Representative"
}
```

#### Update User Profile
- **Endpoint**: `/users/{id}/profile`
- **Method**: PUT
- **Permissions**: Admin only
- **Request Body**:
```json
{
  "name": "Updated Name",
  "department": "Marketing",
  "jobTitle": "Marketing Manager",
  "phone": "+1234567890",
  "location": "New York"
}
```

#### Update User Role
- **Endpoint**: `/users/{id}/role`
- **Method**: PUT
- **Permissions**: Admin only
- **Request Body**:
```json
{
  "role": "Manager"
}
```

#### Send User Invitation
- **Endpoint**: `/users/{id}/invite`
- **Method**: POST
- **Permissions**: Admin only
- **Description**: Send invitation email to pre-provisioned user

#### Get Pending Invitations
- **Endpoint**: `/users/pending-invitations`
- **Method**: GET
- **Permissions**: Admin only
- **Description**: List all pending user invitations

### Projects

#### Create Project
- **Endpoint**: `/projects`
- **Method**: POST
- **Permissions**: Project Manager
- **Request Body**:
```json
{
  "name": "New Project",
  "description": "Project details",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

#### Get Project
- **Endpoint**: `/projects/{projectId}`
- **Method**: GET
- **Description**: Retrieve specific project details

### Reporting

#### Generate Report
- **Endpoint**: `/reports/generate`
- **Method**: POST
- **Permissions**: Manager
- **Request Body**:
```json
{
  "type": "ProjectStatus",
  "projectId": "uuid",
  "format": ["PDF", "Excel"]
}
```

## Error Handling

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Validation Error",
  "errors": [
    "Invalid project name",
    "Start date cannot be in the past"
  ]
}
```

### Error Codes
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

## Rate Limiting
- **Max Requests**: 100 per minute
- **Burst Limit**: 50 requests

## Pagination
All list endpoints support pagination:
```
GET /users?page=2&pageSize=20
```

## WebSocket/SignalR Notifications
Real-time updates via `/notifications` hub.

### Notification Events
- Project Status Change
- User Mentions
- Task Assignments

## Swagger/OpenAPI
Detailed API specification available at:
`/swagger/index.html`

## Best Practices
- Use HTTPS
- Include `X-Request-ID` header
- Handle errors gracefully
- Implement proper logging