namespace Aarogyam.API.Models.Responses;

public class AuditLogRow
{
    public long AuditLogId { get; set; }

    public int? UserId { get; set; }

    public string Action { get; set; } = string.Empty;

    public string EntityName { get; set; } = string.Empty;

    public int EntityId { get; set; }

    public DateTime CreatedAt { get; set; }
}
