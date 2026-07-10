CREATE PROCEDURE dbo.spPatientsManage
    @Action NVARCHAR(10),
    @PatientId INT = NULL,
    @UserId INT = NULL,
    @FirstName NVARCHAR(50) = NULL,
    @MiddleName NVARCHAR(50) = NULL,
    @LastName NVARCHAR(50) = NULL,
    @DateOfBirth DATE = NULL,
    @Gender NVARCHAR(10) = NULL,
    @BloodGroup NVARCHAR(5) = NULL,
    @Address NVARCHAR(200) = NULL,
    @CountryId INT = NULL,
    @StateId INT = NULL,
    @CityId INT = NULL,
    @EmergencyContact NVARCHAR(20) = NULL,
    @QrCodePath NVARCHAR(200) = NULL
AS
BEGIN
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            DECLARE @AarogyamId NVARCHAR(20) = dbo.fnGenerateAarogyamID();
            INSERT INTO dbo.Patients (UserId, AarogyamId, FirstName, MiddleName, LastName, DateOfBirth, Gender,
                BloodGroup, Address, CountryId, StateId, CityId, EmergencyContact, QrCodePath)
            VALUES (@UserId, @AarogyamId, @FirstName, @MiddleName, @LastName, @DateOfBirth, @Gender,
                @BloodGroup, @Address, @CountryId, @StateId, @CityId, @EmergencyContact, @QrCodePath);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS PatientId, @AarogyamId AS AarogyamId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.Patients
            SET UserId = @UserId, FirstName = @FirstName, MiddleName = @MiddleName,
                LastName = @LastName, DateOfBirth = @DateOfBirth, Gender = @Gender, BloodGroup = @BloodGroup,
                Address = @Address, CountryId = @CountryId, StateId = @StateId, CityId = @CityId,
                EmergencyContact = @EmergencyContact, QrCodePath = @QrCodePath, UpdatedAt = SYSUTCDATETIME()
            WHERE PatientId = @PatientId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.Patients WHERE PatientId = @PatientId;
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
