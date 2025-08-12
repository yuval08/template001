using Hangfire;
using Hangfire.PostgreSql;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Interfaces;
using IntranetStarter.Infrastructure.BackgroundJobs;
using IntranetStarter.Infrastructure.Data;
using IntranetStarter.Infrastructure.Localization;
using IntranetStarter.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Localization;
using Microsoft.EntityFrameworkCore;

namespace IntranetStarter.Infrastructure;

public static class DependencyInjection {
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration) {
        // Database
        services.AddDbContext<ApplicationDbContext>(options => {
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

        // Localization
        AddLocalization(services, configuration);

        // Services
        services.AddScoped<IPdfService, PdfService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<INotificationService, NotificationService>();

        // Background Jobs
        AddHangfire(services, configuration);
        services.AddScoped<ReportGenerationJob>();

        return services;
    }

    private static void AddFileStorage(IServiceCollection services, IConfiguration configuration) {
        var storageDriver = configuration["STORAGE_DRIVER"] ?? "Local";

        switch (storageDriver.ToLowerInvariant()) {
            case "s3":
                services.AddScoped<IFileStore, S3FileStore>();
                break;
            case "azure" or "azureblob":
                services.AddScoped<IFileStore, AzureBlobFileStore>();
                break;
            default:
                services.AddScoped<IFileStore, LocalFileStore>();
                break;
        }
    }

    private static void AddHangfire(IServiceCollection services, IConfiguration configuration) {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddHangfire(config => {
            config.UsePostgreSqlStorage(options => { options.UseNpgsqlConnection(connectionString); }, new PostgreSqlStorageOptions {
                QueuePollInterval        = TimeSpan.FromSeconds(15),
                InvisibilityTimeout      = TimeSpan.FromMinutes(5),
                PrepareSchemaIfNecessary = true,
                SchemaName               = "hangfire"
            });

            config.UseSimpleAssemblyNameTypeSerializer();
            config.UseRecommendedSerializerSettings();
        });

        services.AddHangfireServer(options => {
            options.WorkerCount = Environment.ProcessorCount;
            options.Queues      = ["default", "reports", "emails", "cleanup"];
        });
    }

    private static void AddLocalization(IServiceCollection services, IConfiguration configuration)
    {
        // Configure localization options
        services.Configure<Infrastructure.Localization.LocalizationOptions>(configuration.GetSection(Infrastructure.Localization.LocalizationOptions.SectionName));
        
        // Validate configuration
        var localizationOptions = configuration.GetSection(Infrastructure.Localization.LocalizationOptions.SectionName).Get<Infrastructure.Localization.LocalizationOptions>();
        if (localizationOptions != null)
        {
            localizationOptions.Validate();
        }

        // Add localization services
        services.AddLocalization(options =>
        {
            options.ResourcesPath = "Resources";
        });

        // Add custom localization service
        services.AddScoped<ILocalizationService, LocalizationService>();
        
        // Add string localizer for SharedResources
        services.AddScoped<IStringLocalizer<SharedResources>, StringLocalizer<SharedResources>>();
    }
}