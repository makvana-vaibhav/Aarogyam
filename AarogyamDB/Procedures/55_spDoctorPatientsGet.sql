CREATE OR ALTER PROCEDURE dbo.spDoctorPatientsGet
    @DoctorId INT,
    @Search NVARCHAR(100) = NULL
AS
BEGIN
    SELECT
        p.PatientId,
        p.AarogyamId,
        p.FirstName,
        p.MiddleName,
        p.LastName,
        p.DateOfBirth,
        p.Gender,
        p.BloodGroup,
        MAX(v.VisitDate) AS LastVisitDate,
        COUNT(v.VisitId) AS TotalVisits
    FROM dbo.Patients p
    JOIN dbo.Visits v ON v.PatientId = p.PatientId
    WHERE v.DoctorId = @DoctorId
      AND (
        @Search IS NULL
        OR p.AarogyamId LIKE '%' + @Search + '%'
        OR p.FirstName LIKE '%' + @Search + '%'
        OR p.LastName LIKE '%' + @Search + '%'
        OR (p.FirstName + ' ' + p.LastName) LIKE '%' + @Search + '%'
      )
    GROUP BY
        p.PatientId, p.AarogyamId, p.FirstName, p.MiddleName, p.LastName,
        p.DateOfBirth, p.Gender, p.BloodGroup
    ORDER BY MAX(v.VisitDate) DESC;
END
