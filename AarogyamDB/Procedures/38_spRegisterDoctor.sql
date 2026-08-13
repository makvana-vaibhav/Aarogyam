CREATE OR ALTER PROCEDURE dbo.spRegisterDoctor
    @Email NVARCHAR(100),
    @PhoneNumber NVARCHAR(20),
    @PasswordHash NVARCHAR(200),
    @FirstName NVARCHAR(50),
    @MiddleName NVARCHAR(50) = NULL,
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
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.Users WHERE Email = @Email)
    BEGIN
        SELECT 0 AS Success, 'This email address is already registered. Please log in or use another email.' AS Message, NULL AS UserId;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.Users WHERE PhoneNumber = @PhoneNumber)
    BEGIN
        SELECT 0 AS Success, 'This mobile number is already registered. Please log in or use another mobile number.' AS Message, NULL AS UserId;
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM dbo.Doctors WHERE LicenseNumber = @LicenseNumber)
    BEGIN
        SELECT 0 AS Success, 'A doctor profile with this medical license number is already registered.' AS Message, NULL AS UserId;
        RETURN;
    END

    BEGIN TRY
        DECLARE @RoleId INT;
        SELECT @RoleId = RoleId FROM dbo.RoleMaster WHERE RoleName = 'Doctor';

        BEGIN TRANSACTION;

        INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
        VALUES (@RoleId, @Email, @PhoneNumber, @PasswordHash, 0, 1);

        DECLARE @NewUserId INT = SCOPE_IDENTITY();

        INSERT INTO dbo.Doctors (UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId,
            SpecializationId, LicenseDocumentPath, DegreeDocumentPath, Address, CountryId, StateId, CityId, ApprovalStatus)
        VALUES (@NewUserId, @FirstName, @MiddleName, @LastName, @LicenseNumber, @HospitalId, @DegreeId,
            @SpecializationId, @LicenseDocumentPath, @DegreeDocumentPath, @Address, @CountryId, @StateId, @CityId, 'Pending');

        COMMIT TRANSACTION;

        SELECT 1 AS Success, 'Doctor registered, waiting for admin approval.' AS Message, @NewUserId AS UserId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        DECLARE @Err NVARCHAR(1000) = ERROR_MESSAGE();
        DECLARE @UserMsg NVARCHAR(500) = @Err;

        IF ERROR_NUMBER() IN (2627, 2601)
        BEGIN
            IF @Err LIKE '%PhoneNumber%' OR @Err LIKE '%Phone%'
                SET @UserMsg = 'This mobile number is already registered. Please log in or use another mobile number.';
            ELSE IF @Err LIKE '%Email%'
                SET @UserMsg = 'This email address is already registered. Please log in or use another email.';
            ELSE IF @Err LIKE '%LicenseNumber%' OR @Err LIKE '%License%'
                SET @UserMsg = 'A doctor profile with this medical license number is already registered.';
            ELSE
                SET @UserMsg = 'An account with these details already exists. Please log in.';
        END

        SELECT 0 AS Success, @UserMsg AS Message, NULL AS UserId;
    END CATCH
END
