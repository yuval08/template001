# API Documentation

## Overview
This document provides comprehensive details about the Intranet Starter Project's API endpoints, authentication requirements, and usage guidelines.

## Base URL
```
https://api.yourcompany.com/api/v1
```

## Authentication
All API endpoints require authentication via Bearer Token.

### Authentication Methods
1. OAuth2 with Azure AD
2. OAuth2 with Google
3. JWT Token-based authorization

### Request Headers
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

## API Endpoints

### User Management

#### Get Current User
- **Endpoint**: `/users/me`
- **Method**: GET
- **Description**: Retrieve current user's profile information
- **Response**:
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john.doe@company.com",
  "roles": ["Admin", "User"],
  "department": "IT"
}
```

#### List Users
- **Endpoint**: `/users`
- **Method**: GET
- **Permissions**: Admin
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `pageSize`: Items per page (default: 10)

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