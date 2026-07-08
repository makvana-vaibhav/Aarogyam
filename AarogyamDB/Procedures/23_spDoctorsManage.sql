CREATE PROCEDURE dbo.spDoctorsManage
    @Action NVARCHAR(10),
    @DoctorId INT = NULL,
    @UserId INT = NULL,
    @FirstName NVARCHAR(50) = NULL,
    @MiddleName NVARCHAR(50) = NULL,
    @LastName NVARCHAR(50) = NULL,
    @LicenseNumber NVARCHAR(50) = NULL,
    @HospitalId INT = NULL,
    @DegreeId INT = NULL,
    @SpecializationId INT = NULL,
    @LicenseDocumentPath NVARCHAR(200) = NULL,
    @DegreeDocumentPath NVARCHAR(200) = NULL,
    @ApprovalStatus NVARCHAR(20) = NULL,
    @ApprovedByUserId INT = NULL,
    @ApprovedAt DATETIME2 = NULL,
    @RejectionReason NVARCHAR(200) = NULL,
    @Address NVARCHAR(200) = NULL,
    @CountryId INT = NULL,
    @StateId INT = NULL,
    @CityId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Action = 'INSERT'
        BEGIN
            INSERT INTO dbo.Doctors (UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId,
                SpecializationId, LicenseDocumentPath, DegreeDocumentPath, Address, CountryId, StateId, CityId)
            VALUES (@UserId, @FirstName, @MiddleName, @LastName, @LicenseNumber, @HospitalId, @DegreeId,
                @SpecializationId, @LicenseDocumentPath, @DegreeDocumentPath, @Address, @CountryId, @StateId, @CityId);
            SELECT 1 AS Success, 'Created.' AS Message, SCOPE_IDENTITY() AS DoctorId;
        END
        ELSE IF @Action = 'UPDATE'
        BEGIN
            UPDATE dbo.Doctors
            SET UserId = @UserId, FirstName = @FirstName, MiddleName = @MiddleName, LastName = @LastName,
                LicenseNumber = @LicenseNumber, HospitalId = @HospitalId, DegreeId = @DegreeId,
                SpecializationId = @SpecializationId, LicenseDocumentPath = @LicenseDocumentPath,
                DegreeDocumentPath = @DegreeDocumentPath, ApprovalStatus = @ApprovalStatus,
                ApprovedByUserId = @ApprovedByUserId, ApprovedAt = @ApprovedAt, RejectionReason = @RejectionReason,
                Address = @Address, CountryId = @CountryId, StateId = @StateId, CityId = @CityId, UpdatedAt = SYSUTCDATETIME()
            WHERE DoctorId = @DoctorId;
            SELECT 1 AS Success, 'Updated.' AS Message;
        END
        ELSE IF @Action = 'DELETE'
        BEGIN
            DELETE FROM dbo.Doctors WHERE DoctorId = @DoctorId;
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
