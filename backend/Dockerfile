# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first for better layer caching
COPY IntranetStarter.sln ./
COPY Api/Api.csproj ./Api/
COPY Application/Application.csproj ./Application/
COPY Domain/Domain.csproj ./Domain/
COPY Infrastructure/Infrastructure.csproj ./Infrastructure/
COPY Tests.Unit/Tests.Unit.csproj ./Tests.Unit/
COPY Tests.Integration/Tests.Integration.csproj ./Tests.Integration/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY . .

# Build and test
RUN dotnet build --no-restore -c Release
RUN dotnet test Tests.Unit/Tests.Unit.csproj --no-build -c Release --logger trx
RUN dotnet test Tests.Integration/Tests.Integration.csproj --no-build -c Release --logger trx

# Publish the API project
RUN dotnet publish Api/Api.csproj -c Release -o /app/publish --no-restore

# Development stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS development
WORKDIR /app

# Install curl for health checks and debugging tools
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Create necessary directories with proper permissions
RUN mkdir -p /app/uploads /app/logs && \
    chown -R appuser:appuser /app

COPY --from=build --chown=appuser:appuser /app/publish .

# Switch to non-root user
USER appuser

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "IntranetStarter.Api.dll"]

# Production stage (default)
FROM development AS production

# Production-specific optimizations
ENV DOTNET_EnableDiagnostics=0
ENV DOTNET_USE_POLLING_FILE_WATCHER=false
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true

# Additional security and performance settings
ENV COMPlus_EnableDiagnostics=0
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1