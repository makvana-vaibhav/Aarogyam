CREATE OR ALTER PROCEDURE dbo.spForgotPassword
    @Email NVARCHAR(100)
AS
BEGIN
    BEGIN TRY
        DECLARE @UserId INT;
        SELECT @UserId = UserId FROM dbo.Users WHERE Email = @Email AND IsActive = 1;

        IF @UserId IS NULL
        BEGIN
            SELECT 0 AS Success, 'No active account found with this email address.' AS Message, NULL AS UserId;
            RETURN;
        END

        SELECT 1 AS Success, 'Account found.' AS Message, @UserId AS UserId;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message, NULL AS UserId;
    END CATCH
END
