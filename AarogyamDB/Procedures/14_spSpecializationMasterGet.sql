CREATE OR ALTER PROCEDURE dbo.spSpecializationMasterGet
    @SpecializationId INT = NULL,
    @DegreeId INT = NULL
AS
BEGIN
    IF @SpecializationId IS NOT NULL
        SELECT * FROM dbo.SpecializationMaster WHERE SpecializationId = @SpecializationId;
    ELSE IF @DegreeId IS NOT NULL
        SELECT * FROM dbo.SpecializationMaster WHERE DegreeId = @DegreeId ORDER BY SpecializationName ASC;
    ELSE
        SELECT * FROM dbo.SpecializationMaster ORDER BY SpecializationName ASC;
END

