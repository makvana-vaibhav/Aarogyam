CREATE OR ALTER PROCEDURE dbo.spOTPMasterManage
    @Action NVARCHAR(10),
    @OtpId INT = NULL,
    @UserId INT = NULL,
    @OtpCode NVARCHAR(10) = NULL,
    @ExpiresAt DATETIME2 = NULL,
    @IsUsed BIT = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.OTPMaster (UserId, OtpCode, ExpiresAt, IsUsed) VALUES (@UserId, @OtpCode, @ExpiresAt, @IsUsed);
            -- SCOPE_IDENTITY() is returned as decimal(38,0); cast it to match
            -- the API result model's nullable int OtpId property.
            SELECT 1 AS Success, 'Created.' AS Message, CAST(SCOPE_IDENTITY() AS INT) AS OtpId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.OTPMaster
            SET UserId = @UserId, OtpCode = @OtpCode, ExpiresAt = @ExpiresAt, IsUsed = @IsUsed
            WHERE OtpId = @OtpId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.OTPMaster WHERE OtpId = @OtpId;
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
