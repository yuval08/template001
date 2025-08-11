namespace IntranetStarter.Application.Interfaces;

public interface IPdfService {
    Task<byte[]> GenerateProjectReportAsync(Guid             projectId, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateSampleReportAsync(CancellationToken cancellationToken = default);
}
