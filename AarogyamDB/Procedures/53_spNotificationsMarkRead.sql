-- Ownership check and update in one statement: a notification is only
-- marked read if it actually belongs to @UserId, otherwise 0 rows are
-- touched and Success comes back 0 - no separate fetch needed first.
CREATE OR ALTER PROCEDURE dbo.spNotificationsMarkRead
    @NotificationId INT,
    @UserId INT
AS
BEGIN
    BEGIN TRY
        UPDATE dbo.Notifications SET IsRead = 1 WHERE NotificationId = @NotificationId AND UserId = @UserId;

        IF @@ROWCOUNT > 0
            SELECT 1 AS Success, 'Updated.' AS Message;
        ELSE
            SELECT 0 AS Success, 'Notification not found.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
