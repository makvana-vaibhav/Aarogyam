-- Resolves the acting user's display name (patient/doctor name, falling back
-- to their email for admins or users with no profile row yet) so the audit
-- trail is readable without cross-referencing user IDs by hand.
CREATE OR ALTER PROCEDURE dbo.spAuditLogsGet
    @AuditLogId BIGINT = NULL,
    @UserId INT = NULL
AS
BEGIN
    SELECT
        al.AuditLogId,
        al.UserId,
        al.Action,
        al.EntityName,
        al.EntityId,
        al.CreatedAt,
        u.Email AS UserEmail,
        rm.RoleName,
        COALESCE(
            NULLIF(LTRIM(RTRIM(ISNULL(p.FirstName, '') + ' ' + ISNULL(p.LastName, ''))), ''),
            NULLIF(LTRIM(RTRIM(ISNULL(d.FirstName, '') + ' ' + ISNULL(d.LastName, ''))), ''),
            u.Email
        ) AS UserName
    FROM dbo.AuditLogs al
    LEFT JOIN dbo.Users u ON u.UserId = al.UserId
    LEFT JOIN dbo.RoleMaster rm ON rm.RoleId = u.RoleId
    LEFT JOIN dbo.Patients p ON p.UserId = u.UserId
    LEFT JOIN dbo.Doctors d ON d.UserId = u.UserId
    WHERE (@AuditLogId IS NULL OR al.AuditLogId = @AuditLogId)
      AND (@UserId IS NULL OR al.UserId = @UserId)
    ORDER BY al.CreatedAt DESC;
END
