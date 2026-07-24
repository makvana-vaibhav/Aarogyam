CREATE OR ALTER PROCEDURE dbo.spPatientsSetQrCode
    @PatientId INT,
    @QrCodePath NVARCHAR(200)
AS
BEGIN
    BEGIN TRY
        UPDATE dbo.Patients SET QrCodePath = @QrCodePath, UpdatedAt = SYSUTCDATETIME() WHERE PatientId = @PatientId;

        IF @@ROWCOUNT > 0
            SELECT 1 AS Success, 'Updated.' AS Message;
        ELSE
            SELECT 0 AS Success, 'Patient not found.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
