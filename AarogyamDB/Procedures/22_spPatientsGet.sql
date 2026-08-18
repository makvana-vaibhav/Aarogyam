CREATE OR ALTER PROCEDURE dbo.spPatientsGet
    @PatientId INT = NULL,
    @UserId INT = NULL,
    @AarogyamId NVARCHAR(50) = NULL,
    @SearchName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @PatientId IS NOT NULL
        SELECT p.PatientId, p.UserId, p.AarogyamId, p.FirstName, p.MiddleName, p.LastName, p.DateOfBirth, p.Gender,
               p.BloodGroup, p.Address, p.CountryId, p.StateId, p.CityId, p.EmergencyContact, p.QrCodePath,
               p.ProfilePicturePath, p.CreatedAt, p.UpdatedAt, u.PhoneNumber, u.Email
        FROM dbo.Patients p
        JOIN dbo.Users u ON u.UserId = p.UserId
        WHERE p.PatientId = @PatientId;
    ELSE IF @UserId IS NOT NULL
        SELECT p.PatientId, p.UserId, p.AarogyamId, p.FirstName, p.MiddleName, p.LastName, p.DateOfBirth, p.Gender,
               p.BloodGroup, p.Address, p.CountryId, p.StateId, p.CityId, p.EmergencyContact, p.QrCodePath,
               p.ProfilePicturePath, p.CreatedAt, p.UpdatedAt, u.PhoneNumber, u.Email
        FROM dbo.Patients p
        JOIN dbo.Users u ON u.UserId = p.UserId
        WHERE p.UserId = @UserId;
    ELSE IF @AarogyamId IS NOT NULL AND @SearchName IS NOT NULL
        SELECT p.PatientId, p.UserId, p.AarogyamId, p.FirstName, p.MiddleName, p.LastName, p.DateOfBirth, p.Gender,
               p.BloodGroup, p.Address, p.CountryId, p.StateId, p.CityId, p.EmergencyContact, p.QrCodePath,
               p.ProfilePicturePath, p.CreatedAt, p.UpdatedAt, u.PhoneNumber, u.Email
        FROM dbo.Patients p
        JOIN dbo.Users u ON u.UserId = p.UserId
        WHERE (p.AarogyamId LIKE '%' + LTRIM(RTRIM(@AarogyamId)) + '%')
           OR (p.FirstName LIKE '%' + @SearchName + '%' OR p.LastName LIKE '%' + @SearchName + '%' OR (p.FirstName + ' ' + p.LastName) LIKE '%' + @SearchName + '%');
    ELSE IF @AarogyamId IS NOT NULL
        SELECT p.PatientId, p.UserId, p.AarogyamId, p.FirstName, p.MiddleName, p.LastName, p.DateOfBirth, p.Gender,
               p.BloodGroup, p.Address, p.CountryId, p.StateId, p.CityId, p.EmergencyContact, p.QrCodePath,
               p.ProfilePicturePath, p.CreatedAt, p.UpdatedAt, u.PhoneNumber, u.Email
        FROM dbo.Patients p
        JOIN dbo.Users u ON u.UserId = p.UserId
        WHERE p.AarogyamId LIKE '%' + LTRIM(RTRIM(@AarogyamId)) + '%'
           OR p.FirstName LIKE '%' + LTRIM(RTRIM(@AarogyamId)) + '%'
           OR p.LastName LIKE '%' + LTRIM(RTRIM(@AarogyamId)) + '%'
           OR (p.FirstName + ' ' + ISNULL(p.MiddleName + ' ', '') + p.LastName) LIKE '%' + LTRIM(RTRIM(@AarogyamId)) + '%';
    ELSE IF @SearchName IS NOT NULL
        SELECT p.PatientId, p.UserId, p.AarogyamId, p.FirstName, p.MiddleName, p.LastName, p.DateOfBirth, p.Gender,
               p.BloodGroup, p.Address, p.CountryId, p.StateId, p.CityId, p.EmergencyContact, p.QrCodePath,
               p.ProfilePicturePath, p.CreatedAt, p.UpdatedAt, u.PhoneNumber, u.Email
        FROM dbo.Patients p
        JOIN dbo.Users u ON u.UserId = p.UserId
        WHERE p.FirstName LIKE '%' + @SearchName + '%'
           OR p.LastName LIKE '%' + @SearchName + '%'
           OR (p.FirstName + ' ' + ISNULL(p.MiddleName + ' ', '') + p.LastName) LIKE '%' + @SearchName + '%'
           OR p.AarogyamId LIKE '%' + @SearchName + '%';
    ELSE
        SELECT p.PatientId, p.UserId, p.AarogyamId, p.FirstName, p.MiddleName, p.LastName, p.DateOfBirth, p.Gender,
               p.BloodGroup, p.Address, p.CountryId, p.StateId, p.CityId, p.EmergencyContact, p.QrCodePath,
               p.ProfilePicturePath, p.CreatedAt, p.UpdatedAt, u.PhoneNumber, u.Email
        FROM dbo.Patients p
        JOIN dbo.Users u ON u.UserId = p.UserId
        ORDER BY p.CreatedAt DESC;
END
