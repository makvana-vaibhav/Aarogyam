CREATE OR ALTER PROCEDURE dbo.spVerifyOtp
    @UserId INT,
    @OtpCode NVARCHAR(10)
AS
BEGIN
    BEGIN TRY
        DECLARE @OtpId INT;
        SELECT @OtpId = OtpId FROM dbo.OTPMaster
        WHERE UserId = @UserId AND OtpCode = @OtpCode AND IsUsed = 0 AND ExpiresAt > SYSUTCDATETIME();

        IF @OtpId IS NULL
        BEGIN
            SELECT 0 AS Success, 'Invalid or expired OTP.' AS Message;
            RETURN;
        END

        BEGIN TRANSACTION;

        UPDATE dbo.OTPMaster SET IsUsed = 1 WHERE OtpId = @OtpId;
        UPDATE dbo.Users SET IsEmailVerified = 1, UpdatedAt = SYSUTCDATETIME() WHERE UserId = @UserId;

        COMMIT TRANSACTION;

        SELECT 1 AS Success, 'OTP verified.' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
