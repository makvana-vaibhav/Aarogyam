CREATE OR ALTER PROCEDURE dbo.spDoctorDashboardStats
    @DoctorId INT
AS
BEGIN
    SELECT
        COUNT(DISTINCT v.PatientId) AS PatientsTreated,
        COUNT(*) AS TotalVisits,
        ISNULL(SUM(CASE WHEN CAST(v.VisitDate AS DATE) = CAST(SYSUTCDATETIME() AS DATE) THEN 1 ELSE 0 END), 0) AS VisitsToday,
        (
            SELECT COUNT(*)
            FROM dbo.Diagnoses d
            JOIN dbo.Visits v2 ON v2.VisitId = d.VisitId
            WHERE v2.DoctorId = @DoctorId
              AND d.DiagnosisDate >= DATEADD(DAY, -7, CAST(SYSUTCDATETIME() AS DATE))
        ) AS DiagnosesThisWeek,
        (
            SELECT COUNT(*)
            FROM dbo.Prescriptions p
            JOIN dbo.Visits v3 ON v3.VisitId = p.VisitId
            WHERE v3.DoctorId = @DoctorId
              AND p.PrescriptionDate >= DATEADD(DAY, -7, CAST(SYSUTCDATETIME() AS DATE))
        ) AS PrescriptionsThisWeek
    FROM dbo.Visits v
    WHERE v.DoctorId = @DoctorId;
END
