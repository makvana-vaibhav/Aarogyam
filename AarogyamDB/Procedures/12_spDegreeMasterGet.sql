CREATE PROCEDURE dbo.spDegreeMasterGet
    @DegreeId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @DegreeId IS NULL
        SELECT * FROM dbo.DegreeMaster;
    ELSE
        SELECT * FROM dbo.DegreeMaster WHERE DegreeId = @DegreeId;
END
