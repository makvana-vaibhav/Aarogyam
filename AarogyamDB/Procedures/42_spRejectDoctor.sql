CREATE OR ALTER PROCEDURE dbo.spRejectDoctor
    @DoctorId INT,
    @ApprovedByUserId INT,
    @RejectionReason NVARCHAR(200)
AS
BEGIN
    BEGIN TRY
        DECLARE @UserId INT;
        SELECT @UserId = UserId FROM dbo.Doctors WHERE DoctorId = @DoctorId;

        BEGIN TRANSACTION;

        UPDATE dbo.Doctors
        SET ApprovalStatus = 'Rejected', ApprovedByUserId = @ApprovedByUserId, ApprovedAt = SYSUTCDATETIME(),
            RejectionReason = @RejectionReason, UpdatedAt = SYSUTCDATETIME()
        WHERE DoctorId = @DoctorId;

        INSERT INTO dbo.Notifications (UserId, Title, Message, IsRead)
        VALUES (@UserId, 'Account Rejected', @RejectionReason, 0);

        INSERT INTO dbo.AuditLogs (UserId, Action, EntityName, EntityId)
        VALUES (@ApprovedByUserId, 'REJECT_DOCTOR', 'Doctors', @DoctorId);

        COMMIT TRANSACTION;

        SELECT 1 AS Success, 'Doctor rejected.' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
