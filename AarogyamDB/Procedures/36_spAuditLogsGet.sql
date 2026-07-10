CREATE PROCEDURE dbo.spAuditLogsGet
    @AuditLogId BIGINT = NULL,
    @UserId INT = NULL
AS
BEGIN
    IF @AuditLogId IS NOT NULL
        SELECT * FROM dbo.AuditLogs WHERE AuditLogId = @AuditLogId;
    ELSE IF @UserId IS NOT NULL
        SELECT * FROM dbo.AuditLogs WHERE UserId = @UserId ORDER BY CreatedAt DESC;
    ELSE
        SELECT * FROM dbo.AuditLogs;
END
