CREATE OR ALTER PROCEDURE dbo.spStateMasterGet
    @StateId INT = NULL,
    @CountryId INT = NULL
AS
BEGIN
    IF @StateId IS NOT NULL
        SELECT * FROM dbo.StateMaster WHERE StateId = @StateId;
    ELSE IF @CountryId IS NOT NULL
        SELECT * FROM dbo.StateMaster WHERE CountryId = @CountryId;
    ELSE
        SELECT * FROM dbo.StateMaster;
END
