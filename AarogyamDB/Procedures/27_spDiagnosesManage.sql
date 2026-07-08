CREATE PROCEDURE dbo.spDiagnosesManage
    @Action NVARCHAR(10),
    @DiagnosisId INT = NULL,
    @VisitId INT = NULL,
    @DiagnosisTypeId INT = NULL,
    @DiagnosisTitle NVARCHAR(200) = NULL,
    @Description NVARCHAR(MAX) = NULL,
    @DiagnosisDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.Diagnoses (VisitId, DiagnosisTypeId, DiagnosisTitle, Description, DiagnosisDate)
            VALUES (@VisitId, @DiagnosisTypeId, @DiagnosisTitle, @Description, @DiagnosisDate);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS DiagnosisId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.Diagnoses
            SET VisitId = @VisitId, DiagnosisTypeId = @DiagnosisTypeId, DiagnosisTitle = @DiagnosisTitle,
                Description = @Description, DiagnosisDate = @DiagnosisDate, UpdatedAt = SYSUTCDATETIME()
            WHERE DiagnosisId = @DiagnosisId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.Diagnoses WHERE DiagnosisId = @DiagnosisId;
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
