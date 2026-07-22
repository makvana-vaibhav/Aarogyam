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
            SELECT 1 AS Success, 'Created.' AS Message, CAST(SCOPE_IDENTITY() AS INT) AS RoleId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.RoleMaster SET RoleName = @RoleName WHERE RoleId = @RoleId;
            SELECT 1 AS Success, 'Updated.' AS Message, NULL AS RoleId;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.RoleMaster WHERE RoleId = @RoleId;
            SELECT 1 AS Success, 'Deleted.' AS Message, NULL AS RoleId;
        END
        ELSE
        BEGIN
            SELECT 0 AS Success, 'Invalid action.' AS Message, NULL AS RoleId;
        END
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message, NULL AS RoleId;
    END CATCH
END
