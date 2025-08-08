using Hangfire;
using Hangfire.PostgreSql;
using IntranetStarter.Application.Services;
using IntranetStarter.Domain.Interfaces;
using IntranetStarter.Infrastructure.BackgroundJobs;
using IntranetStarter.Infrastructure.Data;
using IntranetStarter.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace IntranetStarter.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseNpgsql(connectionString);
        });

        // Repository and Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        
        // Data Seeding
        services.AddScoped<IDataSeeder, DataSeeder>();

        // File Storage
        AddFileStorage(services, configuration);

        // Services
        services.AddScoped<IPdfService, PdfService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<INotificationService, NotificationService>();

        // Background Jobs
        AddHangfire(services, configuration);
        services.AddScoped<ReportGenerationJob>();

        return services;
    }

    private static void AddFileStorage(IServiceCollection services, IConfiguration configuration)
    {
        var storageDriver = configuration["STORAGE_DRIVER"] ?? "Local";

        switch (storageDriver.ToLowerInvariant())
        {
            case "s3":
                services.AddScoped<IFileStore, S3FileStore>();
                break;
            case "azure":
            case "azureblob":
                services.AddScoped<IFileStore, AzureBlobFileStore>();
                break;
            case "local":
            default:
                services.AddScoped<IFileStore, LocalFileStore>();
                break;
        }
    }

    private static void AddHangfire(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        services.AddHangfire(config =>
        {
            config.UsePostgreSqlStorage(connectionString, new PostgreSqlStorageOptions
            {
                QueuePollInterval = TimeSpan.FromSeconds(15),
                InvisibilityTimeout = TimeSpan.FromMinutes(5),
                PrepareSchemaIfNecessary = true,
                SchemaName = "hangfire"
            });

            config.UseSimpleAssemblyNameTypeSerializer();
            config.UseRecommendedSerializerSettings();
        });

        services.AddHangfireServer(options =>
        {
            options.WorkerCount = Environment.ProcessorCount;
            options.Queues = new[] { "default", "reports", "emails", "cleanup" };
        });
    }
}