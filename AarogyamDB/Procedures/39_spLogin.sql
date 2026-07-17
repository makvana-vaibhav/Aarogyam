CREATE OR ALTER PROCEDURE dbo.spLogin
    @Email NVARCHAR(100)
AS
BEGIN
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Email = @Email)
        BEGIN
            SELECT 0 AS Success, 'No account found with this email.' AS Message,
                NULL AS UserId, NULL AS Email, NULL AS PasswordHash, NULL AS RoleName,
                CAST(0 AS BIT) AS IsEmailVerified, NULL AS ApprovalStatus;
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM dbo.Users WHERE Email = @Email AND IsActive = 0)
        BEGIN
        -- need to send vals according efcore model to avoid mapping errors, so sending all columns with nulls and default values
            SELECT 0 AS Success, 'This account has been disabled.' AS Message,
                NULL AS UserId, NULL AS Email, NULL AS PasswordHash, NULL AS RoleName,
                CAST(0 AS BIT) AS IsEmailVerified, NULL AS ApprovalStatus;
            RETURN;
        END

        UPDATE dbo.Users SET LastLoginAt = SYSUTCDATETIME() WHERE Email = @Email;

        SELECT 1 AS Success, 'User found.' AS Message,
            u.UserId, u.Email, u.PasswordHash, r.RoleName, u.IsEmailVerified, NULL AS ApprovalStatus
        FROM dbo.Users u
        JOIN dbo.RoleMaster r ON r.RoleId = u.RoleId
        WHERE u.Email = @Email;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message,
            NULL AS UserId, NULL AS Email, NULL AS PasswordHash, NULL AS RoleName,
            CAST(0 AS BIT) AS IsEmailVerified, NULL AS ApprovalStatus;
    END CATCH
END
