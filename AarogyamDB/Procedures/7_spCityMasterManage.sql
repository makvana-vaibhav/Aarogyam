CREATE PROCEDURE dbo.spCityMasterManage
    @Action NVARCHAR(10),
    @CityId INT = NULL,
    @StateId INT = NULL,
    @CityName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.CityMaster (StateId, CityName) VALUES (@StateId, @CityName);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS CityId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.CityMaster
            SET StateId = @StateId, CityName = @CityName, UpdatedAt = SYSUTCDATETIME()
            WHERE CityId = @CityId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.CityMaster WHERE CityId = @CityId;
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
