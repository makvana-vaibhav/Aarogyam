CREATE OR ALTER PROCEDURE dbo.spPatientsGet
    @PatientId INT = NULL,
    @UserId INT = NULL,
    @AarogyamId NVARCHAR(50) = NULL,
    @SearchName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @PatientId IS NOT NULL
        SELECT * FROM dbo.Patients WHERE PatientId = @PatientId;
    ELSE IF @UserId IS NOT NULL
        SELECT * FROM dbo.Patients WHERE UserId = @UserId;
    ELSE IF @AarogyamId IS NOT NULL AND @SearchName IS NOT NULL
        SELECT * FROM dbo.Patients 
        WHERE (AarogyamId LIKE '%' + LTRIM(RTRIM(@AarogyamId)) + '%')
           OR (FirstName LIKE '%' + @SearchName + '%' OR LastName LIKE '%' + @SearchName + '%' OR (FirstName + ' ' + LastName) LIKE '%' + @SearchName + '%');
    ELSE IF @AarogyamId IS NOT NULL
        SELECT * FROM dbo.Patients 
        WHERE AarogyamId LIKE '%' + LTRIM(RTRIM(@AarogyamId)) + '%' 
           OR FirstName LIKE '%' + LTRIM(RTRIM(@AarogyamId)) + '%'
           OR LastName LIKE '%' + LTRIM(RTRIM(@AarogyamId)) + '%'
           OR (FirstName + ' ' + ISNULL(MiddleName + ' ', '') + LastName) LIKE '%' + LTRIM(RTRIM(@AarogyamId)) + '%';
    ELSE IF @SearchName IS NOT NULL
        SELECT * FROM dbo.Patients 
        WHERE FirstName LIKE '%' + @SearchName + '%' 
           OR LastName LIKE '%' + @SearchName + '%' 
           OR (FirstName + ' ' + ISNULL(MiddleName + ' ', '') + LastName) LIKE '%' + @SearchName + '%'
           OR AarogyamId LIKE '%' + @SearchName + '%';
    ELSE
        SELECT * FROM dbo.Patients;
END
