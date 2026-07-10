CREATE PROCEDURE dbo.spUsersManage
    @Action NVARCHAR(10),
    @UserId INT = NULL,
    @RoleId INT = NULL,
    @Email NVARCHAR(100) = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @PasswordHash NVARCHAR(200) = NULL,
    @IsEmailVerified BIT = NULL,
    @IsActive BIT = NULL,
    @LastLoginAt DATETIME2 = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive, LastLoginAt)
            VALUES (@RoleId, @Email, @PhoneNumber, @PasswordHash, @IsEmailVerified, @IsActive, @LastLoginAt);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS UserId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.Users
            SET RoleId = @RoleId, Email = @Email, PhoneNumber = @PhoneNumber, PasswordHash = @PasswordHash,
                IsEmailVerified = @IsEmailVerified, IsActive = @IsActive, LastLoginAt = @LastLoginAt, UpdatedAt = SYSUTCDATETIME()
            WHERE UserId = @UserId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.Users WHERE UserId = @UserId;
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
