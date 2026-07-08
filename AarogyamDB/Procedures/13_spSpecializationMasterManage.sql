CREATE PROCEDURE dbo.spSpecializationMasterManage
    @Action NVARCHAR(10),
    @SpecializationId INT = NULL,
    @SpecializationName NVARCHAR(100) = NULL,
    @Description NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.SpecializationMaster (SpecializationName, Description) VALUES (@SpecializationName, @Description);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS SpecializationId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.SpecializationMaster
            SET SpecializationName = @SpecializationName, Description = @Description, UpdatedAt = SYSUTCDATETIME()
            WHERE SpecializationId = @SpecializationId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.SpecializationMaster WHERE SpecializationId = @SpecializationId;
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
