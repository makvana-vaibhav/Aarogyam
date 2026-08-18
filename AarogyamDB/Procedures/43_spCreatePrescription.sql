CREATE OR ALTER PROCEDURE dbo.spCreatePrescription
    @VisitId INT,
    @DiagnosisId INT = NULL,
    @PrescriptionText NVARCHAR(MAX),
    @PdfPath NVARCHAR(200) = NULL,
    @PrescriptionDate DATE
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
        VALUES (@VisitId, @DiagnosisId, @PrescriptionText, @PdfPath, @PrescriptionDate);

        DECLARE @NewPrescriptionId INT = CAST(SCOPE_IDENTITY() AS INT);

        -- No notification here: prescriptions are only ever created as part of the
        -- Create Visit wizard, which sends one consolidated visit notification/email
        -- (with any uploaded report attached) via DoctorController's /visits/{id}/notify
        -- endpoint once the whole submission completes.

        COMMIT TRANSACTION;

        SELECT 1 AS Success, 'Prescription created.' AS Message, @NewPrescriptionId AS PrescriptionId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message, NULL AS PrescriptionId;
    END CATCH
END
