-- Updates only the fields a doctor can edit on their own profile.
-- LicenseNumber, DegreeId, document paths and approval status are never
-- touched here, so there is no need to fetch the current row first.
CREATE OR ALTER PROCEDURE dbo.spDoctorsUpdateProfile
    @DoctorId INT,
    @FirstName NVARCHAR(50),
    @MiddleName NVARCHAR(50) = NULL,
    @LastName NVARCHAR(50),
    @HospitalId INT,
    @SpecializationId INT,
    @Address NVARCHAR(200),
    @CountryId INT,
    @StateId INT,
    @CityId INT
AS
BEGIN
    BEGIN TRY
        UPDATE dbo.Doctors
        SET FirstName = @FirstName, MiddleName = @MiddleName, LastName = @LastName,
            HospitalId = @HospitalId, SpecializationId = @SpecializationId,
            Address = @Address, CountryId = @CountryId, StateId = @StateId, CityId = @CityId,
            UpdatedAt = SYSUTCDATETIME()
        WHERE DoctorId = @DoctorId;

        IF @@ROWCOUNT > 0
            SELECT 1 AS Success, 'Updated.' AS Message;
        ELSE
            SELECT 0 AS Success, 'Doctor not found.' AS Message;
    END TRY
    BEGIN CATCH
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
