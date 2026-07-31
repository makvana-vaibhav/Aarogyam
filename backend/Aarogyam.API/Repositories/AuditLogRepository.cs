using Aarogyam.API.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly AarogyamDbContext _context;

    public AuditLogRepository(AarogyamDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(int? userId, string action, string entityName, int entityId)
    {
        try
        {
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC dbo.spAuditLogsManage @Action, @AuditLogId, @UserId, @Action_, @EntityName, @EntityId",
                new SqlParameter("@Action", "INSERT"),
                new SqlParameter("@AuditLogId", DBNull.Value),
                new SqlParameter("@UserId", (object?)userId ?? DBNull.Value),
                new SqlParameter("@Action_", action),
                new SqlParameter("@EntityName", entityName),
                new SqlParameter("@EntityId", entityId));
        }
        catch
        {
            // Audit logging must never break the action it is recording.
        }
    }
}
