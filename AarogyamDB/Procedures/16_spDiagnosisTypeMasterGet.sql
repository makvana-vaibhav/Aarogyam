CREATE PROCEDURE dbo.spDiagnosisTypeMasterGet
    @DiagnosisTypeId INT = NULL
AS
BEGIN
    IF @DiagnosisTypeId IS NULL
        SELECT * FROM dbo.DiagnosisTypeMaster;
    ELSE
        SELECT * FROM dbo.DiagnosisTypeMaster WHERE DiagnosisTypeId = @DiagnosisTypeId;
END
