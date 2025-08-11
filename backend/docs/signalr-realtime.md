# SignalR Real-time Notifications

The application uses SignalR for real-time communication and notifications.

## NotificationHub (`/Api/Hubs/NotificationHub.cs`)
- Handles real-time connections
- Manages user/role/project groups
- Methods: `JoinUserGroup`, `LeaveUserGroup`, `JoinProjectGroup`, `SendToAll`, etc.

## NotificationService (`/Infrastructure/Services/NotificationService.cs`)
- Sends notifications via SignalR
- Persists notifications to database
- Integrates with MediatR commands

## Sending Notifications

```csharp
// Inject INotificationService
public class YourService(INotificationService notificationService) {
    public async Task NotifyUser(string userId, string message) {
        await notificationService.SendNotificationAsync(
            userId, 
            message, 
            NotificationType.Info
        );
    }
}
```

## Real-time Features

SignalR is used for real-time notifications:
- Hub endpoint: `/hubs/notifications`
- Client implementation in `frontend/src/hooks/useSignalR.ts`
- Automatic reconnection handling

## Background Jobs

Hangfire manages background tasks:
- Dashboard available at `/hangfire` (admin-only in production)
- Recurring jobs scheduled in Program.cs
- Project report generation scheduled job