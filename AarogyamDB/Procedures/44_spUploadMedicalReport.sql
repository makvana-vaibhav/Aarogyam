CREATE OR ALTER PROCEDURE dbo.spUploadMedicalReport
    @PatientId INT,
    @DoctorId INT = NULL, -- NULL when the patient uploads their own report
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
        BEGIN TRANSACTION;

        INSERT INTO dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId,
            Title, ReportType, FilePath, FileSize, ReportDate)
        VALUES (@VisitId, @DiagnosisId, @PatientId, @DoctorId, @UploadedByUserId,
            @Title, @ReportType, @FilePath, @FileSize, @ReportDate);

        DECLARE @NewReportId INT = CAST(SCOPE_IDENTITY() AS INT);

        -- No notification here when a doctor uploads it: doctor-uploaded reports only
        -- ever happen as part of the Create Visit wizard, which sends one consolidated
        -- visit notification/email (with this report attached) via DoctorController's
        -- /visits/{id}/notify endpoint once the whole submission completes. Patients
        -- uploading their own report (@UploadedByUserId = the patient's own UserId)
        -- never needed a notification to themselves anyway.

        COMMIT TRANSACTION;

        SELECT 1 AS Success, 'Report uploaded.' AS Message, @NewReportId AS ReportId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message, NULL AS ReportId;
    END CATCH
END
