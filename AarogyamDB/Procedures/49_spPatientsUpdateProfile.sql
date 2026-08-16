-- Updates only the fields a patient can edit on their own profile.
-- UserId, AarogyamId and QrCodePath are never touched here, so there is
-- no need to fetch the current row first just to preserve them.
CREATE OR ALTER PROCEDURE dbo.spPatientsUpdateProfile
    @PatientId INT,
    @FirstName NVARCHAR(50),
    @MiddleName NVARCHAR(50) = NULL,
    @LastName NVARCHAR(50),
    @DateOfBirth DATE,
    @Gender NVARCHAR(10),
    @BloodGroup NVARCHAR(5) = NULL,
    @Address NVARCHAR(200),
    @CountryId INT,
    @StateId INT,
    @CityId INT,
    @EmergencyContact NVARCHAR(20) = NULL,
    @ProfilePicturePath NVARCHAR(200) = NULL
AS
BEGIN
    BEGIN TRY
        UPDATE dbo.Patients
        SET FirstName = @FirstName, MiddleName = @MiddleName, LastName = @LastName,
            DateOfBirth = @DateOfBirth, Gender = @Gender, BloodGroup = @BloodGroup,
            Address = @Address, CountryId = @CountryId, StateId = @StateId, CityId = @CityId,
            EmergencyContact = @EmergencyContact, ProfilePicturePath = @ProfilePicturePath, UpdatedAt = SYSUTCDATETIME()
        WHERE PatientId = @PatientId;

        IF @@ROWCOUNT > 0
            SELECT 1 AS Success, 'Updated.' AS Message;
        ELSE
            SELECT 0 AS Success, 'Patient not found.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
