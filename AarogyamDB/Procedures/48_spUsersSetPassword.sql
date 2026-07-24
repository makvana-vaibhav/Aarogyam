CREATE OR ALTER PROCEDURE dbo.spUsersSetPassword
    @UserId INT,
    @PasswordHash NVARCHAR(200)
AS
BEGIN
    BEGIN TRY
        UPDATE dbo.Users SET PasswordHash = @PasswordHash, UpdatedAt = SYSUTCDATETIME() WHERE UserId = @UserId;

        IF @@ROWCOUNT > 0
            SELECT 1 AS Success, 'Updated.' AS Message;
        ELSE
            SELECT 0 AS Success, 'User not found.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
