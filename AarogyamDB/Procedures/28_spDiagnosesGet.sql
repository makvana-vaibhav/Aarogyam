CREATE OR ALTER PROCEDURE dbo.spDiagnosesGet
    @DiagnosisId INT = NULL,
    @VisitId INT = NULL,
    @PatientId INT = NULL,
    @DiagnosisTypeId INT = NULL
AS
BEGIN
    IF @DiagnosisId IS NOT NULL
        SELECT * FROM dbo.Diagnoses WHERE DiagnosisId = @DiagnosisId;
    ELSE IF @VisitId IS NOT NULL
        SELECT * FROM dbo.Diagnoses WHERE VisitId = @VisitId;
    ELSE IF @PatientId IS NOT NULL
        SELECT d.* FROM dbo.Diagnoses d
        JOIN dbo.Visits v ON v.VisitId = d.VisitId
        WHERE v.PatientId = @PatientId
          AND (@DiagnosisTypeId IS NULL OR d.DiagnosisTypeId = @DiagnosisTypeId)
        ORDER BY d.DiagnosisDate DESC;
    ELSE
        SELECT * FROM dbo.Diagnoses;
END
