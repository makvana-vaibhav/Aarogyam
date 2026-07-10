CREATE OR ALTER PROCEDURE dbo.spCountryMasterGet
    @CountryId INT = NULL
AS
BEGIN
    IF @CountryId IS NULL
        SELECT * FROM dbo.CountryMaster;
    ELSE
        SELECT * FROM dbo.CountryMaster WHERE CountryId = @CountryId;
END
