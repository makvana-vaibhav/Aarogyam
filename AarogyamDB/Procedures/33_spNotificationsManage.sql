CREATE PROCEDURE dbo.spNotificationsManage
    @Action NVARCHAR(10),
    @NotificationId INT = NULL,
    @UserId INT = NULL,
    @Title NVARCHAR(100) = NULL,
    @Message NVARCHAR(500) = NULL,
    @IsRead BIT = NULL,
    @EmailSentAt DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.Notifications (UserId, Title, Message, IsRead, EmailSentAt)
            VALUES (@UserId, @Title, @Message, @IsRead, @EmailSentAt);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS NotificationId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.Notifications
            SET UserId = @UserId, Title = @Title, Message = @Message, IsRead = @IsRead, EmailSentAt = @EmailSentAt
            WHERE NotificationId = @NotificationId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.Notifications WHERE NotificationId = @NotificationId;
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
