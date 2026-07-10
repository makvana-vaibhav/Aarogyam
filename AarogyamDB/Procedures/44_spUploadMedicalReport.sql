CREATE OR ALTER PROCEDURE dbo.spUploadMedicalReport
    @PatientId INT,
    @DoctorId INT,
    @UploadedByUserId INT,
    @Title NVARCHAR(200),
    @ReportType NVARCHAR(50),
    @FilePath NVARCHAR(200),
    @FileSize INT = NULL,
    @ReportDate DATE = NULL,
    @VisitId INT = NULL,
    @DiagnosisId INT = NULL
AS
BEGIN
    BEGIN TRY
        DECLARE @PatientUserId INT;
        SELECT @PatientUserId = UserId FROM dbo.Patients WHERE PatientId = @PatientId;

        BEGIN TRANSACTION;

        INSERT INTO dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId,
            Title, ReportType, FilePath, FileSize, ReportDate)
        VALUES (@VisitId, @DiagnosisId, @PatientId, @DoctorId, @UploadedByUserId,
            @Title, @ReportType, @FilePath, @FileSize, @ReportDate);

        DECLARE @NewReportId INT = SCOPE_IDENTITY();

        IF @UploadedByUserId <> @PatientUserId
        BEGIN
            INSERT INTO dbo.Notifications (UserId, Title, Message, IsRead)
            VALUES (@PatientUserId, 'New Report Uploaded', 'A new medical report has been added to your record.', 0);
        END

        COMMIT TRANSACTION;

        SELECT 1 AS Success, 'Report uploaded.' AS Message, @NewReportId AS ReportId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
