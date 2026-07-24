CREATE OR ALTER PROCEDURE dbo.spPrescriptionsManage
    @Action NVARCHAR(10),
    @PrescriptionId INT = NULL,
    @VisitId INT = NULL,
    @DiagnosisId INT = NULL,
    @PrescriptionText NVARCHAR(MAX) = NULL,
    @PdfPath NVARCHAR(200) = NULL,
    @PrescriptionDate DATE = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
            VALUES (@VisitId, @DiagnosisId, @PrescriptionText, @PdfPath, @PrescriptionDate);
            SELECT 1 AS Success, 'Created.' AS Message, CAST(SCOPE_IDENTITY() AS INT) AS PrescriptionId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.Prescriptions
            SET VisitId = @VisitId, DiagnosisId = @DiagnosisId, PrescriptionText = @PrescriptionText,
                PdfPath = @PdfPath, PrescriptionDate = @PrescriptionDate, UpdatedAt = SYSUTCDATETIME()
            WHERE PrescriptionId = @PrescriptionId;
            SELECT 1 AS Success, 'Updated.' AS Message, NULL AS PrescriptionId;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.Prescriptions WHERE PrescriptionId = @PrescriptionId;
            SELECT 1 AS Success, 'Deleted.' AS Message, NULL AS PrescriptionId;
        END
        ELSE
        BEGIN
            SELECT 0 AS Success, 'Invalid action.' AS Message, NULL AS PrescriptionId;
        END
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message, NULL AS PrescriptionId;
    END CATCH
END
