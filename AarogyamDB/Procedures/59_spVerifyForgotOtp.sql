CREATE OR ALTER PROCEDURE dbo.spVerifyForgotOtp
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
            SELECT 0 AS Success, 'Invalid or expired OTP code. Please enter the correct OTP.' AS Message;
            RETURN;
        END

        SELECT 1 AS Success, 'OTP verified successfully. Please enter your new password.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
