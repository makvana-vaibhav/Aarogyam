CREATE PROCEDURE dbo.spMedicalReportsGet
    @ReportId INT = NULL,
    @PatientId INT = NULL,
    @VisitId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @ReportId IS NOT NULL
        SELECT * FROM dbo.MedicalReports WHERE ReportId = @ReportId;
    ELSE IF @PatientId IS NOT NULL
        SELECT * FROM dbo.MedicalReports WHERE PatientId = @PatientId ORDER BY ReportDate DESC;
    ELSE IF @VisitId IS NOT NULL
        SELECT * FROM dbo.MedicalReports WHERE VisitId = @VisitId;
    ELSE
        SELECT * FROM dbo.MedicalReports;
END
