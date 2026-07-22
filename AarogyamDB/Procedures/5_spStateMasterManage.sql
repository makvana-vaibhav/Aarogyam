CREATE OR ALTER PROCEDURE dbo.spStateMasterManage
    @Action NVARCHAR(10),
    @StateId INT = NULL,
    @CountryId INT = NULL,
    @StateName NVARCHAR(100) = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.StateMaster (CountryId, StateName) VALUES (@CountryId, @StateName);
            SELECT 1 AS Success, 'Created.' AS Message, CAST(SCOPE_IDENTITY() AS INT) AS StateId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.StateMaster
            SET CountryId = @CountryId, StateName = @StateName, UpdatedAt = SYSUTCDATETIME()
            WHERE StateId = @StateId;
            SELECT 1 AS Success, 'Updated.' AS Message, NULL AS StateId;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.StateMaster WHERE StateId = @StateId;
            SELECT 1 AS Success, 'Deleted.' AS Message, NULL AS StateId;
        END
        ELSE
        BEGIN
            SELECT 0 AS Success, 'Invalid action.' AS Message, NULL AS StateId;
        END
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message, NULL AS StateId;
    END CATCH
END
