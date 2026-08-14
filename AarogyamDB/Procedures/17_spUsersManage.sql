CREATE OR ALTER PROCEDURE dbo.spUsersManage
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
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive, LastLoginAt)
            VALUES (@RoleId, @Email, @PhoneNumber, @PasswordHash, @IsEmailVerified, @IsActive, @LastLoginAt);
            SELECT 1 AS Success, 'Created.' AS Message, CAST(SCOPE_IDENTITY() AS INT) AS UserId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.Users
            SET RoleId = @RoleId, Email = @Email, PhoneNumber = @PhoneNumber, PasswordHash = @PasswordHash,
                IsEmailVerified = @IsEmailVerified, IsActive = @IsActive, LastLoginAt = @LastLoginAt, UpdatedAt = SYSUTCDATETIME()
            WHERE UserId = @UserId;
            SELECT 1 AS Success, 'Updated.' AS Message, NULL AS UserId;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM dbo.Users u
                JOIN dbo.RoleMaster r ON u.RoleId = r.RoleId
                WHERE u.UserId = @UserId AND r.RoleName = 'Admin'
            )
            BEGIN
                SELECT 0 AS Success, 'Admin accounts cannot be deleted.' AS Message, NULL AS UserId;
            END
            ELSE
            BEGIN
                DELETE FROM dbo.MedicalReports WHERE UploadedByUserId = @UserId;
                UPDATE dbo.Doctors SET ApprovedByUserId = NULL WHERE ApprovedByUserId = @UserId;
                DELETE FROM dbo.Users WHERE UserId = @UserId;
                SELECT 1 AS Success, 'Deleted.' AS Message, NULL AS UserId;
            END
        END
        ELSE
        BEGIN
            SELECT 0 AS Success, 'Invalid action.' AS Message, NULL AS UserId;
        END
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message, NULL AS UserId;
    END CATCH
END
