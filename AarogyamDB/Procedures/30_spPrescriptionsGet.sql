CREATE PROCEDURE dbo.spPrescriptionsGet
    @PrescriptionId INT = NULL,
    @VisitId INT = NULL,
    @PatientId INT = NULL
AS
BEGIN
    IF @PrescriptionId IS NOT NULL
        SELECT * FROM dbo.Prescriptions WHERE PrescriptionId = @PrescriptionId;
    ELSE IF @VisitId IS NOT NULL
        SELECT * FROM dbo.Prescriptions WHERE VisitId = @VisitId;
    ELSE IF @PatientId IS NOT NULL
        SELECT p.* FROM dbo.Prescriptions p
        JOIN dbo.Visits v ON v.VisitId = p.VisitId
        WHERE v.PatientId = @PatientId
        ORDER BY p.PrescriptionDate DESC;
    ELSE
        SELECT * FROM dbo.Prescriptions;
END
