CREATE PROCEDURE dbo.spAuditLogsManage
    @Action NVARCHAR(10),
    @AuditLogId BIGINT = NULL,
    @UserId INT = NULL,
    @Action_ NVARCHAR(100) = NULL,
    @EntityName NVARCHAR(50) = NULL,
    @EntityId INT = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.AuditLogs (UserId, Action, EntityName, EntityId) VALUES (@UserId, @Action_, @EntityName, @EntityId);
            SELECT 1 AS Success, 'Created.' AS Message, CAST(SCOPE_IDENTITY() AS BIGINT) AS AuditLogId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.AuditLogs
            SET UserId = @UserId, Action = @Action_, EntityName = @EntityName, EntityId = @EntityId
            WHERE AuditLogId = @AuditLogId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.AuditLogs WHERE AuditLogId = @AuditLogId;
            SELECT 1 AS Success, 'Deleted.' AS Message;
        END
        ELSE
        BEGIN
            SELECT 0 AS Success, 'Invalid action.' AS Message;
        END
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
