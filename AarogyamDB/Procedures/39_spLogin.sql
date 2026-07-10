CREATE PROCEDURE dbo.spLogin
    @Email NVARCHAR(100)
AS
BEGIN
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = @Email)
        BEGIN
            SELECT 0 AS Success, 'No account found with this email.' AS Message;
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM dbo.Users WHERE Email = @Email AND IsActive = 0)
        BEGIN
            SELECT 0 AS Success, 'This account has been disabled.' AS Message;
            RETURN;
        END

        UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME() WHERE Email = @Email;

        SELECT 1 AS Success, 'User found.' AS Message,
            u.UserId, u.Email, u.PasswordHash, u.IsEmailVerified, r.RoleName
        FROM dbo.Users u
        JOIN dbo.RoleMaster r ON r.RoleId = u.RoleId
        WHERE u.Email = @Email;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
