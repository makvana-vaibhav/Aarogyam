CREATE OR ALTER PROCEDURE dbo.spCreatePrescription
    @VisitId INT,
    @DiagnosisId INT = NULL,
    @PrescriptionText NVARCHAR(MAX),
    @PdfPath NVARCHAR(200) = NULL,
    @PrescriptionDate DATE
AS
BEGIN
    BEGIN TRY
        DECLARE @PatientUserId INT;
        SELECT @PatientUserId = p.UserId
        FROM dbo.Visits v
        JOIN dbo.Patients p ON p.PatientId = v.PatientId
        WHERE v.VisitId = @VisitId;

        BEGIN TRANSACTION;

        INSERT INTO dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
        VALUES (@VisitId, @DiagnosisId, @PrescriptionText, @PdfPath, @PrescriptionDate);

        DECLARE @NewPrescriptionId INT = SCOPE_IDENTITY();

        INSERT INTO dbo.Notifications (UserId, Title, Message, IsRead)
        VALUES (@PatientUserId, 'New Prescription', 'A new prescription has been added to your health record.', 0);

        COMMIT TRANSACTION;

        SELECT 1 AS Success, 'Prescription created.' AS Message, @NewPrescriptionId AS PrescriptionId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
