CREATE OR ALTER PROCEDURE dbo.spDiagnosisTypeMasterManage
    @Action NVARCHAR(10),
    @DiagnosisTypeId INT = NULL,
    @DiagnosisTypeName NVARCHAR(100) = NULL,
    @Description NVARCHAR(200) = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.DiagnosisTypeMaster (DiagnosisTypeName, Description, IsActive)
            VALUES (@DiagnosisTypeName, @Description, @IsActive);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS DiagnosisTypeId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.DiagnosisTypeMaster
            SET DiagnosisTypeName = @DiagnosisTypeName, Description = @Description, IsActive = @IsActive, UpdatedAt = SYSUTCDATETIME()
            WHERE DiagnosisTypeId = @DiagnosisTypeId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.DiagnosisTypeMaster WHERE DiagnosisTypeId = @DiagnosisTypeId;
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
