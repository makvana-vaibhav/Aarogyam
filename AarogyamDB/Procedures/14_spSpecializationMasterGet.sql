CREATE PROCEDURE dbo.spSpecializationMasterGet
    @SpecializationId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @SpecializationId IS NULL
        SELECT * FROM dbo.SpecializationMaster;
    ELSE
        SELECT * FROM dbo.SpecializationMaster WHERE SpecializationId = @SpecializationId;
END
