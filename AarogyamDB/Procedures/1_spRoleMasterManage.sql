CREATE OR ALTER PROCEDURE dbo.spRoleMasterManage
    @Action NVARCHAR(10),
    @RoleId INT = NULL,
    @RoleName NVARCHAR(20) = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.RoleMaster (RoleName) VALUES (@RoleName);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS RoleId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.RoleMaster SET RoleName = @RoleName WHERE RoleId = @RoleId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.RoleMaster WHERE RoleId = @RoleId;
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
