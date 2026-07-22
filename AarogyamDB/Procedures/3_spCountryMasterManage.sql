CREATE OR ALTER PROCEDURE dbo.spCountryMasterManage
    @Action NVARCHAR(10),
    @CountryId INT = NULL,
    @CountryName NVARCHAR(100) = NULL,
    @CountryCode NVARCHAR(10) = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.CountryMaster (CountryName, CountryCode, IsActive) VALUES (@CountryName, @CountryCode, @IsActive);
            SELECT 1 AS Success, 'Created.' AS Message, CAST(SCOPE_IDENTITY() AS INT) AS CountryId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.CountryMaster
            SET CountryName = @CountryName, CountryCode = @CountryCode, IsActive = @IsActive, UpdatedAt = SYSUTCDATETIME()
            WHERE CountryId = @CountryId;
            SELECT 1 AS Success, 'Updated.' AS Message, NULL AS CountryId;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.CountryMaster WHERE CountryId = @CountryId;
            SELECT 1 AS Success, 'Deleted.' AS Message, NULL AS CountryId;
        END
        ELSE
        BEGIN
            SELECT 0 AS Success, 'Invalid action.' AS Message, NULL AS CountryId;
        END
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message, NULL AS CountryId;
    END CATCH
END
