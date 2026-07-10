CREATE OR ALTER PROCEDURE dbo.spVisitsManage
    @Action NVARCHAR(10),
    @VisitId INT = NULL,
    @PatientId INT = NULL,
    @DoctorId INT = NULL,
    @VisitDate DATETIME2 = NULL,
    @Notes NVARCHAR(MAX) = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.Visits (PatientId, DoctorId, VisitDate, Notes) VALUES (@PatientId, @DoctorId, @VisitDate, @Notes);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS VisitId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.Visits
            SET PatientId = @PatientId, DoctorId = @DoctorId, VisitDate = @VisitDate, Notes = @Notes, UpdatedAt = SYSUTCDATETIME()
            WHERE VisitId = @VisitId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.Visits WHERE VisitId = @VisitId;
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
