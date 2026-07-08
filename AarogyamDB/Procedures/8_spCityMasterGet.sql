CREATE PROCEDURE dbo.spCityMasterGet
    @CityId INT = NULL,
    @StateId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @CityId IS NOT NULL
        SELECT * FROM dbo.CityMaster WHERE CityId = @CityId;
    ELSE IF @StateId IS NOT NULL
        SELECT * FROM dbo.CityMaster WHERE StateId = @StateId;
    ELSE
        SELECT * FROM dbo.CityMaster;
END
