# Email Templates

The application uses HTML email templates with dynamic content replacement for professional email communications.

## Email Template Structure

Email templates are stored in `/Infrastructure/EmailTemplates/` and include:
- `InvitationEmail.html` - HTML template for user invitations
- `logo.svg` - Company logo embedded in emails
- `logo_base64.txt` - Base64 encoded logo for fallback

## Adding New Email Templates

1. **Create HTML Template** in `/Infrastructure/EmailTemplates/`:
   ```html
   <!-- File: /Infrastructure/EmailTemplates/YourEmailTemplate.html -->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <title>{{ApplicationName}} - Your Subject</title>
   </head>
   <body style="font-family: 'Segoe UI', sans-serif; background-color: #f5f5f5;">
       <!-- Email content with placeholders -->
       <h1>{{ApplicationName}}</h1>
       <p>Hello {{UserName}},</p>
       <!-- Include logo as embedded attachment -->
       <img src="cid:logo" alt="{{ApplicationName}}" />
       <!-- More content... -->
   </body>
   </html>
   ```

2. **Available Template Placeholders**:
   - `{{ApplicationName}}` - Application name from configuration
   - `{{ApplicationUrl}}` - Base application URL
   - `{{Year}}` - Current year for copyright
   - Custom placeholders based on your email type

3. **Email Service Integration**:
   ```csharp
   // In your command handler or service
   private async Task SendYourEmailAsync(YourData data, CancellationToken cancellationToken) {
       var applicationName = configuration["ApplicationName"] ?? "Intranet Starter";
       var applicationUrl = configuration["ApplicationUrl"] ?? "http://localhost:3000";
       
       var subject = $"Your Email Subject - {applicationName}";
       
       // Load HTML template
       var templatePath = Path.Combine(
           AppDomain.CurrentDomain.BaseDirectory, 
           "Infrastructure", 
           "EmailTemplates", 
           "YourEmailTemplate.html"
       );
       
       // Fallback path for development
       if (!File.Exists(templatePath)) {
           templatePath = Path.Combine(
               Directory.GetCurrentDirectory(), 
               "Infrastructure", 
               "EmailTemplates", 
               "YourEmailTemplate.html"
           );
       }
       
       string body;
       if (File.Exists(templatePath)) {
           body = await File.ReadAllTextAsync(templatePath, cancellationToken);
           
           // Replace placeholders
           body = body.Replace("{{ApplicationName}}", applicationName)
                      .Replace("{{ApplicationUrl}}", applicationUrl)
                      .Replace("{{Year}}", DateTime.UtcNow.Year.ToString())
                      .Replace("{{UserName}}", data.UserName)
                      .Replace("{{CustomPlaceholder}}", data.CustomValue);
       }
       else {
           // Provide fallback HTML if template not found
           logger.LogWarning("Email template not found at {TemplatePath}", templatePath);
           body = GetFallbackEmailHtml(applicationName, data);
       }

       // Load logo for attachment
       byte[]? logoBytes = null;
       string? logoFileName = null;
       
       var logoPath = Path.Combine(
           AppDomain.CurrentDomain.BaseDirectory, 
           "Infrastructure", 
           "EmailTemplates", 
           "logo.svg"
       );
       if (!File.Exists(logoPath)) {
           logoPath = Path.Combine(
               Directory.GetCurrentDirectory(), 
               "Infrastructure", 
               "EmailTemplates", 
               "logo.svg"
           );
       }
       
       if (File.Exists(logoPath)) {
           logoBytes = await File.ReadAllBytesAsync(logoPath, cancellationToken);
           logoFileName = "logo.svg";
       }

       // Send email with logo attachment
       await emailService.SendEmailAsync(
           data.Email,
           subject,
           body,
           attachment: logoBytes,
           attachmentName: logoFileName,
           cancellationToken: cancellationToken
       );
   }
   ```

## Template Best Practices

- Use inline CSS for maximum email client compatibility
- Include fallback fonts: `font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;`
- Use table-based layouts for better email client support
- Reference logo as `src="cid:logo"` for embedded attachment
- Provide fallback HTML in case template file is missing
- Always include unsubscribe/support links in footer

## Template Development

- Test templates across different email clients (Gmail, Outlook, Apple Mail)
- Use responsive design techniques with media queries
- Keep total email size under 100KB including attachments
- Validate HTML to ensure proper rendering

## Existing Email Template Examples

- **Invitation Email** (`InvitationEmail.html`): Professional invitation with role assignment, expiration warning, and call-to-action button
- Includes gradient styling, embedded logo, and responsive design
- Features step-by-step instructions and safety disclaimers

## Email Configuration

Required environment variables for email functionality:
- `ApplicationName` - Your application's display name
- `ApplicationUrl` - Base URL for links in emails
- `SMTP_*` - Email service configuration (see main CLAUDE.md)