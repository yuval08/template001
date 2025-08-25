# API Documentation

## Overview

The API follows RESTful conventions with consistent response formats and comprehensive error handling.

**Base URL**: `http://localhost:5000/api` (development)  
**Authentication**: JWT Bearer tokens via HTTP-only cookies  
**Content Type**: `application/json`

## Authentication Endpoints

### Login Flow
```http
GET /auth/login/azure
# Redirects to Azure AD login

GET /auth/login/google  
# Redirects to Google OAuth login

GET /auth/callback/azure
# Azure AD callback (handled automatically)

GET /auth/callback/google
# Google OAuth callback (handled automatically)
```

### User Session
```http
GET /api/auth/profile
# Get current user profile

POST /api/auth/logout
# Logout current user

GET /api/auth/status
# Check authentication status
```

**Response Example:**
```json
{
  "id": 1,
  "email": "user@company.com",
  "name": "John Doe",
  "role": "Manager",
  "lastLoginAt": "2024-01-15T10:30:00Z",
  "isActive": true
}
```

## User Management Endpoints

### Get Users
```http
GET /api/users
Authorization: Required (All authenticated users)
```

**Query Parameters:**
- `search` (string): Filter by name or email
- `role` (string): Filter by role (Admin, Manager, Employee)
- `pageNumber` (int): Page number (default: 1)
- `pageSize` (int): Items per page (default: 10, max: 100)

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "email": "user@company.com",
      "name": "John Doe",
      "role": "Manager",
      "lastLoginAt": "2024-01-15T10:30:00Z",
      "isActive": true,
      "createdAt": "2024-01-01T08:00:00Z"
    }
  ],
  "totalCount": 25,
  "pageNumber": 1,
  "pageSize": 10,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

### Get User by ID
```http
GET /api/users/{id}
Authorization: Required (All authenticated users)
```

### Update User Role
```http
PUT /api/users/{id}/role
Authorization: Required (Admin only)

{
  "role": "Manager"
}
```

### Deactivate User
```http
DELETE /api/users/{id}
Authorization: Required (Admin only)
```

## Project Management Endpoints

### Get Projects
```http
GET /api/projects
Authorization: Required (All authenticated users)
```

**Query Parameters:**
- `search` (string): Filter by name or description
- `status` (string): Filter by status (Active, Completed, Archived)
- `assignedUserId` (int): Filter by assigned user
- `pageNumber` (int): Page number
- `pageSize` (int): Items per page

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Website Redesign",
      "description": "Complete redesign of company website",
      "status": "Active",
      "createdBy": {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@company.com"
      },
      "assignedUsers": [
        {
          "id": 1,
          "name": "John Doe",
          "email": "john@company.com"
        }
      ],
      "createdAt": "2024-01-01T08:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z"
    }
  ],
  "totalCount": 12,
  "pageNumber": 1,
  "pageSize": 10
}
```

### Create Project
```http
POST /api/projects
Authorization: Required (Manager or Admin)

{
  "name": "New Project",
  "description": "Project description",
  "assignedUserIds": [1, 2, 3]
}
```

### Update Project
```http
PUT /api/projects/{id}
Authorization: Required (Manager or Admin, or assigned user)

{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "Completed",
  "assignedUserIds": [1, 2]
}
```

### Delete Project
```http
DELETE /api/projects/{id}
Authorization: Required (Admin only)
```

## File Management Endpoints

### Upload File
```http
POST /api/files
Authorization: Required (All authenticated users)
Content-Type: multipart/form-data

Form Data:
- file: (binary file)
- projectId: (int, optional)
- description: (string, optional)
```

**Response:**
```json
{
  "id": 1,
  "fileName": "document.pdf",
  "originalFileName": "Project Document.pdf",
  "contentType": "application/pdf",
  "fileSize": 1024000,
  "description": "Project requirements document",
  "uploadedBy": {
    "id": 1,
    "name": "John Doe"
  },
  "projectId": 5,
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

### Get Files
```http
GET /api/files
Authorization: Required (All authenticated users)
```

**Query Parameters:**
- `projectId` (int): Filter by project
- `uploadedById` (int): Filter by uploader
- `search` (string): Filter by filename
- `pageNumber` (int): Page number
- `pageSize` (int): Items per page

### Download File
```http
GET /api/files/{id}/download
Authorization: Required (All authenticated users)

Response: Binary file content with appropriate headers
```

### Delete File
```http
DELETE /api/files/{id}
Authorization: Required (File owner, Manager, or Admin)
```

## Reporting Endpoints

### Generate Report
```http
POST /api/reports/generate
Authorization: Required (Manager or Admin)

{
  "reportType": "UserActivity",
  "dateFrom": "2024-01-01T00:00:00Z",
  "dateTo": "2024-01-31T23:59:59Z",
  "parameters": {
    "includeInactiveUsers": false
  }
}
```

**Response:**
```json
{
  "reportId": "abc123",
  "status": "Processing",
  "reportType": "UserActivity",
  "requestedAt": "2024-01-15T10:30:00Z",
  "estimatedCompletionTime": "2024-01-15T10:35:00Z"
}
```

### Get Report Status
```http
GET /api/reports/{reportId}/status
Authorization: Required (Manager or Admin)
```

### Download Report
```http
GET /api/reports/{reportId}/download
Authorization: Required (Manager or Admin)

Response: CSV or PDF file based on report type
```

## Search Endpoints

### Global Search
```http
GET /api/search
Authorization: Required (All authenticated users)
```

**Query Parameters:**
- `query` (string, required): Search term
- `types` (string[]): Entity types to search (users, projects, files)
- `pageNumber` (int): Page number
- `pageSize` (int): Items per page

**Response:**
```json
{
  "query": "website",
  "results": {
    "projects": [
      {
        "id": 1,
        "name": "Website Redesign",
        "description": "Complete redesign...",
        "type": "project",
        "relevanceScore": 0.95
      }
    ],
    "files": [
      {
        "id": 3,
        "fileName": "website-mockup.pdf",
        "description": "Website design mockup",
        "type": "file",
        "relevanceScore": 0.87
      }
    ],
    "users": []
  },
  "totalResults": 2,
  "searchTime": 0.045
}
```

## System Endpoints

### Health Check
```http
GET /api/health
Authorization: Not required

Response:
{
  "status": "Healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "Healthy",
    "redis": "Healthy",
    "email": "Healthy"
  }
}
```

### Application Info
```http
GET /api/info
Authorization: Required (Admin only)

Response:
{
  "version": "1.0.0",
  "environment": "Production",
  "buildDate": "2024-01-15T08:00:00Z",
  "uptime": "5d 14h 32m",
  "memoryUsage": "245 MB"
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more validation errors occurred",
    "details": [
      {
        "field": "email",
        "message": "Email address is required"
      },
      {
        "field": "name",
        "message": "Name must be at least 2 characters"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "traceId": "abc123def456"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic error)
- `500` - Internal Server Error

## Rate Limiting

### Limits
- **General API**: 100 requests per minute per user
- **File Upload**: 10 requests per minute per user
- **Search**: 30 requests per minute per user
- **Report Generation**: 5 requests per hour per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642248600
```

## API Versioning

### Current Version
All endpoints are currently version 1. Future versions will be handled via:
- **Header**: `API-Version: 2.0`
- **Query Parameter**: `?version=2.0`
- **URL Path**: `/api/v2/users` (for major changes)

## Real-time Updates (SignalR)

### Connection
```javascript
// Connect to SignalR hub
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/hubs/notifications")
  .build();

connection.start();
```

### Available Events
- `UserCreated` - New user registered
- `ProjectUpdated` - Project status changed
- `FileUploaded` - New file uploaded
- `NotificationReceived` - General notification

### Example Usage
```javascript
connection.on("ProjectUpdated", (project) => {
  console.log(`Project ${project.name} was updated`);
  // Update UI accordingly
});
```

## Testing the API

### Using cURL
```bash
# Login and get cookie
curl -c cookies.txt -X POST http://localhost:5000/auth/login

# Use cookie for authenticated request
curl -b cookies.txt http://localhost:5000/api/users

# Upload file
curl -b cookies.txt -X POST \
  -F "file=@document.pdf" \
  -F "projectId=1" \
  http://localhost:5000/api/files
```

### Using Swagger UI
Visit `http://localhost:5000/swagger` for interactive API documentation and testing interface.

This API provides a comprehensive set of endpoints for managing users, projects, files, and system operations in your intranet application.