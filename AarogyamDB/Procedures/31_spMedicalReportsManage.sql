CREATE PROCEDURE dbo.spMedicalReportsManage
    @Action NVARCHAR(10),
    @ReportId INT = NULL,
    @VisitId INT = NULL,
    @DiagnosisId INT = NULL,
    @PatientId INT = NULL,
    @DoctorId INT = NULL,
    @UploadedByUserId INT = NULL,
    @Title NVARCHAR(200) = NULL,
    @ReportType NVARCHAR(50) = NULL,
    @FilePath NVARCHAR(200) = NULL,
    @FileSize INT = NULL,
    @ReportDate DATE = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId,
                Title, ReportType, FilePath, FileSize, ReportDate)
            VALUES (@VisitId, @DiagnosisId, @PatientId, @DoctorId, @UploadedByUserId,
                @Title, @ReportType, @FilePath, @FileSize, @ReportDate);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS ReportId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.MedicalReports
            SET VisitId = @VisitId, DiagnosisId = @DiagnosisId, PatientId = @PatientId, DoctorId = @DoctorId,
                UploadedByUserId = @UploadedByUserId, Title = @Title, ReportType = @ReportType,
                FilePath = @FilePath, FileSize = @FileSize, ReportDate = @ReportDate, UpdatedAt = SYSUTCDATETIME()
            WHERE ReportId = @ReportId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.MedicalReports WHERE ReportId = @ReportId;
            SELECT 1 AS Success, 'Deleted.' AS Message;
        END
        ELSE
        BEGIN
            SELECT 0 AS Success, 'Invalid action.' AS Message;
        END
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
