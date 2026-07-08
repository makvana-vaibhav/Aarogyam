CREATE PROCEDURE dbo.spPatientsGet
    @PatientId INT = NULL,
    @UserId INT = NULL,
    @AarogyamId NVARCHAR(20) = NULL,
    @SearchName NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @PatientId IS NOT NULL
        SELECT * FROM dbo.Patients WHERE PatientId = @PatientId;
    ELSE IF @UserId IS NOT NULL
        SELECT * FROM dbo.Patients WHERE UserId = @UserId;
    ELSE IF @AarogyamId IS NOT NULL
        SELECT * FROM dbo.Patients WHERE AarogyamId = @AarogyamId;
    ELSE IF @SearchName IS NOT NULL
        SELECT * FROM dbo.Patients WHERE FirstName LIKE '%' + @SearchName + '%' OR LastName LIKE '%' + @SearchName + '%';
    ELSE
        SELECT * FROM dbo.Patients;
END
