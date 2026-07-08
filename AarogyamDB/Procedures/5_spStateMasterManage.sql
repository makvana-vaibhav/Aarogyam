CREATE PROCEDURE dbo.spStateMasterManage
    @Action NVARCHAR(10),
    @StateId INT = NULL,
    @CountryId INT = NULL,
    @StateName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.StateMaster (CountryId, StateName) VALUES (@CountryId, @StateName);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS StateId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.StateMaster
            SET CountryId = @CountryId, StateName = @StateName, UpdatedAt = SYSUTCDATETIME()
            WHERE StateId = @StateId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.StateMaster WHERE StateId = @StateId;
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
