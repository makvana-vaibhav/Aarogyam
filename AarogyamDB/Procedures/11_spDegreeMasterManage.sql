CREATE PROCEDURE dbo.spDegreeMasterManage
    @Action NVARCHAR(10),
    @DegreeId INT = NULL,
    @DegreeName NVARCHAR(100) = NULL,
    @ShortName NVARCHAR(20) = NULL,
    @Description NVARCHAR(200) = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.DegreeMaster (DegreeName, ShortName, Description) VALUES (@DegreeName, @ShortName, @Description);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS DegreeId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.DegreeMaster
            SET DegreeName = @DegreeName, ShortName = @ShortName, Description = @Description, UpdatedAt = SYSUTCDATETIME()
            WHERE DegreeId = @DegreeId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.DegreeMaster WHERE DegreeId = @DegreeId;
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
