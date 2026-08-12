CREATE OR ALTER PROCEDURE dbo.spRegisterDoctor
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
        DECLARE @Err NVARCHAR(1000) = ERROR_MESSAGE();
        DECLARE @UserMsg NVARCHAR(500) = @Err;

        IF ERROR_NUMBER() IN (2627, 2601)
        BEGIN
            IF @Err LIKE '%PhoneNumber%' OR @Err LIKE '%UQ_Users_PhoneNumber%'
                SET @UserMsg = 'This mobile number is already registered. Please log in or use another number.';
            ELSE IF @Err LIKE '%Email%' OR @Err LIKE '%UQ_Users_Email%'
                SET @UserMsg = 'This email address is already registered. Please log in or use another email.';
            ELSE IF @Err LIKE '%LicenseNumber%' OR @Err LIKE '%UQ_Doctors_LicenseNumber%'
                SET @UserMsg = 'This medical license number is already registered.';
            ELSE
                SET @UserMsg = 'An account with these details already exists. Please log in.';
        END

        SELECT 0 AS Success, @UserMsg AS Message, NULL AS UserId;
    END CATCH
END
