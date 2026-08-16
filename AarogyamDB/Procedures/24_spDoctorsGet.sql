CREATE OR ALTER PROCEDURE dbo.spDoctorsGet
    @DoctorId INT = NULL,
    @UserId INT = NULL,
    @ApprovalStatus NVARCHAR(20) = NULL
AS
BEGIN
    IF @DoctorId IS NOT NULL
        SELECT DoctorId, UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId,
               SpecializationId, LicenseDocumentPath, DegreeDocumentPath, ApprovalStatus, ApprovedByUserId,
               ApprovedAt, RejectionReason, Address, CountryId, StateId, CityId, ProfilePicturePath,
               CreatedAt, UpdatedAt
        FROM dbo.Doctors WHERE DoctorId = @DoctorId;
    ELSE IF @UserId IS NOT NULL
        SELECT DoctorId, UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId,
               SpecializationId, LicenseDocumentPath, DegreeDocumentPath, ApprovalStatus, ApprovedByUserId,
               ApprovedAt, RejectionReason, Address, CountryId, StateId, CityId, ProfilePicturePath,
               CreatedAt, UpdatedAt
        FROM dbo.Doctors WHERE UserId = @UserId;
    ELSE IF @ApprovalStatus IS NOT NULL
        SELECT DoctorId, UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId,
               SpecializationId, LicenseDocumentPath, DegreeDocumentPath, ApprovalStatus, ApprovedByUserId,
               ApprovedAt, RejectionReason, Address, CountryId, StateId, CityId, ProfilePicturePath,
               CreatedAt, UpdatedAt
        FROM dbo.Doctors WHERE ApprovalStatus = @ApprovalStatus;
    ELSE
        SELECT DoctorId, UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId,
               SpecializationId, LicenseDocumentPath, DegreeDocumentPath, ApprovalStatus, ApprovedByUserId,
               ApprovedAt, RejectionReason, Address, CountryId, StateId, CityId, ProfilePicturePath,
               CreatedAt, UpdatedAt
        FROM dbo.Doctors;
END
