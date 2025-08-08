namespace IntranetStarter.Infrastructure.Data;

/// <summary>
/// Interface for data seeding operations
/// </summary>
public interface IDataSeeder
{
    /// <summary>
    /// Seeds the database with initial data appropriate for the current environment
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task SeedAsync(CancellationToken cancellationToken = default);
}