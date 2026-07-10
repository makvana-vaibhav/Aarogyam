CREATE PROCEDURE dbo.spVisitsGet
    @VisitId INT = NULL,
    @PatientId INT = NULL,
    @DoctorId INT = NULL
AS
BEGIN
    IF @VisitId IS NOT NULL
        SELECT * FROM dbo.Visits WHERE VisitId = @VisitId;
    ELSE IF @PatientId IS NOT NULL
        SELECT * FROM dbo.Visits WHERE PatientId = @PatientId ORDER BY VisitDate DESC;
    ELSE IF @DoctorId IS NOT NULL
        SELECT * FROM dbo.Visits WHERE DoctorId = @DoctorId ORDER BY VisitDate DESC;
    ELSE
        SELECT * FROM dbo.Visits;
END
