CREATE PROCEDURE dbo.spDiagnosesGet
    @DiagnosisId INT = NULL,
    @VisitId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @DiagnosisId IS NOT NULL
        SELECT * FROM dbo.Diagnoses WHERE DiagnosisId = @DiagnosisId;
    ELSE IF @VisitId IS NOT NULL
        SELECT * FROM dbo.Diagnoses WHERE VisitId = @VisitId;
    ELSE
        SELECT * FROM dbo.Diagnoses;
END
