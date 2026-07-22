CREATE OR ALTER PROCEDURE dbo.spHospitalMasterManage
    @Action NVARCHAR(10),
    @HospitalId INT = NULL,
    @HospitalName NVARCHAR(150) = NULL,
    @Address NVARCHAR(200) = NULL,
    @CityId INT = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @Email NVARCHAR(100) = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.HospitalMaster (HospitalName, Address, CityId, PhoneNumber, Email, IsActive)
            VALUES (@HospitalName, @Address, @CityId, @PhoneNumber, @Email, @IsActive);
            SELECT 1 AS Success, 'Created.' AS Message, CAST(SCOPE_IDENTITY() AS INT) AS HospitalId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.HospitalMaster
            SET HospitalName = @HospitalName, Address = @Address, CityId = @CityId,
                PhoneNumber = @PhoneNumber, Email = @Email, IsActive = @IsActive, UpdatedAt = SYSUTCDATETIME()
            WHERE HospitalId = @HospitalId;
            SELECT 1 AS Success, 'Updated.' AS Message, NULL AS HospitalId;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.HospitalMaster WHERE HospitalId = @HospitalId;
            SELECT 1 AS Success, 'Deleted.' AS Message, NULL AS HospitalId;
        END
        ELSE
        BEGIN
            SELECT 0 AS Success, 'Invalid action.' AS Message, NULL AS HospitalId;
        END
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message, NULL AS HospitalId;
    END CATCH
END
