CREATE PROCEDURE dbo.spRegisterDoctor
    @Email NVARCHAR(100),
    @PhoneNumber NVARCHAR(20),
    @PasswordHash NVARCHAR(200),
    @FirstName NVARCHAR(50),
    @MiddleName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @LicenseNumber NVARCHAR(50),
    @HospitalId INT,
    @DegreeId INT,
    @SpecializationId INT,
    @LicenseDocumentPath NVARCHAR(200),
    @DegreeDocumentPath NVARCHAR(200),
    @Address NVARCHAR(200),
    @CountryId INT,
    @StateId INT,
    @CityId INT
AS
BEGIN
    BEGIN TRY
        DECLARE @RoleId INT;
        SELECT @RoleId = RoleId FROM dbo.RoleMaster WHERE RoleName = 'Doctor';

        BEGIN TRANSACTION;

        INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
        VALUES (@RoleId, @Email, @PhoneNumber, @PasswordHash, 0, 1);

        DECLARE @NewUserId INT = SCOPE_IDENTITY();

        INSERT INTO dbo.Doctors (UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId,
            SpecializationId, LicenseDocumentPath, DegreeDocumentPath, Address, CountryId, StateId, CityId)
        VALUES (@NewUserId, @FirstName, @MiddleName, @LastName, @LicenseNumber, @HospitalId, @DegreeId,
            @SpecializationId, @LicenseDocumentPath, @DegreeDocumentPath, @Address, @CountryId, @StateId, @CityId);

        COMMIT TRANSACTION;

        SELECT 1 AS Success, 'Doctor registered, waiting for admin approval.' AS Message, @NewUserId AS UserId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
