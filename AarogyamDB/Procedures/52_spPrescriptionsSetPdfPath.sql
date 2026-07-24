CREATE OR ALTER PROCEDURE dbo.spPrescriptionsSetPdfPath
    @PrescriptionId INT,
    @PdfPath NVARCHAR(200)
AS
BEGIN
    BEGIN TRY
        UPDATE dbo.Prescriptions SET PdfPath = @PdfPath, UpdatedAt = SYSUTCDATETIME() WHERE PrescriptionId = @PrescriptionId;

        IF @@ROWCOUNT > 0
            SELECT 1 AS Success, 'Updated.' AS Message;
        ELSE
            SELECT 0 AS Success, 'Prescription not found.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
