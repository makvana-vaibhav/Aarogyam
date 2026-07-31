namespace Aarogyam.API.Repositories;

public interface IAuditLogRepository
{
    Task LogAsync(int? userId, string action, string entityName, int entityId);
}
