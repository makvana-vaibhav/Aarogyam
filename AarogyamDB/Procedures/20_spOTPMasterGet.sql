CREATE PROCEDURE dbo.spOTPMasterGet
    @OtpId INT = NULL,
    @UserId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @OtpId IS NOT NULL
        SELECT * FROM dbo.OTPMaster WHERE OtpId = @OtpId;
    ELSE IF @UserId IS NOT NULL
        SELECT TOP 1 * FROM dbo.OTPMaster
        WHERE UserId = @UserId AND IsUsed = 0 AND ExpiresAt > SYSUTCDATETIME()
        ORDER BY CreatedAt DESC;
    ELSE
        SELECT * FROM dbo.OTPMaster;
END
