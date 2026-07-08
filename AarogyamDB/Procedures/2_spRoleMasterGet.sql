CREATE PROCEDURE dbo.spRoleMasterGet
    @RoleId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @RoleId IS NULL
        SELECT * FROM dbo.RoleMaster;
    ELSE
        SELECT * FROM dbo.RoleMaster WHERE RoleId = @RoleId;
END
