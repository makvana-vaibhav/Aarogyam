CREATE OR ALTER PROCEDURE dbo.spNotificationsGet
    @NotificationId INT = NULL,
    @UserId INT = NULL
AS
BEGIN
    IF @NotificationId IS NOT NULL
        SELECT * FROM dbo.Notifications WHERE NotificationId = @NotificationId;
    ELSE IF @UserId IS NOT NULL
        SELECT * FROM dbo.Notifications WHERE UserId = @UserId ORDER BY CreatedAt DESC;
    ELSE
        SELECT * FROM dbo.Notifications;
END
