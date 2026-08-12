CREATE OR ALTER PROCEDURE dbo.spRegisterPatient
    @Email NVARCHAR(100),
    @PhoneNumber NVARCHAR(20),
    @PasswordHash NVARCHAR(200),
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
    @EmergencyContact NVARCHAR(20) = NULL
AS
BEGIN
    BEGIN TRY
        DECLARE @RoleId INT;
        SELECT @RoleId = RoleId FROM dbo.RoleMaster WHERE RoleName = 'Patient';

        BEGIN TRANSACTION;

        INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
        VALUES (@RoleId, @Email, @PhoneNumber, @PasswordHash, 0, 1);

        DECLARE @NewUserId INT = SCOPE_IDENTITY();
        DECLARE @AarogyamId NVARCHAR(20) = dbo.fnGenerateAarogyamID();

        INSERT INTO dbo.Patients (UserId, AarogyamId, FirstName, MiddleName, LastName, DateOfBirth, Gender,
            BloodGroup, Address, CountryId, StateId, CityId, EmergencyContact)
        VALUES (@NewUserId, @AarogyamId, @FirstName, @MiddleName, @LastName, @DateOfBirth, @Gender,
            @BloodGroup, @Address, @CountryId, @StateId, @CityId, @EmergencyContact);

        COMMIT TRANSACTION;

        SELECT 1 AS Success, 'Patient registered successfully.' AS Message, @NewUserId AS UserId, @AarogyamId AS AarogyamId;
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
            ELSE
                SET @UserMsg = 'An account with these details already exists. Please log in.';
        END

        SELECT 0 AS Success, @UserMsg AS Message, NULL AS UserId, NULL AS AarogyamId;
    END CATCH
END
