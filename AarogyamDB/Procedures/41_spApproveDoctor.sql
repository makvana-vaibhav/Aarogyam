CREATE OR ALTER PROCEDURE dbo.spApproveDoctor
    @DoctorId INT,
    @ApprovedByUserId INT
AS
BEGIN
    BEGIN TRY
        DECLARE @UserId INT;
        SELECT @UserId = UserId FROM dbo.Doctors WHERE DoctorId = @DoctorId;

        BEGIN TRANSACTION;

        UPDATE dbo.Doctors
        SET ApprovalStatus = 'Approved', ApprovedByUserId = @ApprovedByUserId, ApprovedAt = SYSUTCDATETIME(), UpdatedAt = SYSUTCDATETIME()
        WHERE DoctorId = @DoctorId;

        INSERT INTO dbo.Notifications (UserId, Title, Message, IsRead)
        VALUES (@UserId, 'Account Approved', 'Your doctor account has been approved. You can now log in.', 0);

        INSERT INTO dbo.AuditLogs (UserId, Action, EntityName, EntityId)
        VALUES (@ApprovedByUserId, 'APPROVE_DOCTOR', 'Doctors', @DoctorId);

        COMMIT TRANSACTION;

        SELECT 1 AS Success, 'Doctor approved.' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
