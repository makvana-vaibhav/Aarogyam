CREATE OR ALTER PROCEDURE dbo.spUsersSetActive
    @UserId INT,
    @IsActive BIT
AS
BEGIN
    BEGIN TRY
        UPDATE dbo.Users SET IsActive = @IsActive, UpdatedAt = SYSUTCDATETIME() WHERE UserId = @UserId;

        IF @@ROWCOUNT > 0
            SELECT 1 AS Success, 'Updated.' AS Message;
        ELSE
            SELECT 0 AS Success, 'User not found.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
