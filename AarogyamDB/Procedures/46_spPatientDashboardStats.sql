CREATE OR ALTER PROCEDURE dbo.spPatientDashboardStats
    @PatientId INT
AS
BEGIN
    DECLARE @UserId INT = (SELECT UserId FROM dbo.Patients WHERE PatientId = @PatientId);

    SELECT
        (SELECT COUNT(*) FROM dbo.Visits WHERE PatientId = @PatientId) AS TotalVisits,
        (SELECT MAX(VisitDate) FROM dbo.Visits WHERE PatientId = @PatientId) AS LastVisitDate,
        (SELECT COUNT(*) FROM dbo.Diagnoses d JOIN dbo.Visits v ON v.VisitId = d.VisitId
            WHERE v.PatientId = @PatientId) AS TotalDiagnoses,
        (SELECT COUNT(*) FROM dbo.Prescriptions p JOIN dbo.Visits v ON v.VisitId = p.VisitId
            WHERE v.PatientId = @PatientId) AS TotalPrescriptions,
        (SELECT COUNT(*) FROM dbo.MedicalReports WHERE PatientId = @PatientId) AS TotalReports,
        (SELECT COUNT(*) FROM dbo.MedicalReports WHERE PatientId = @PatientId
            AND ReportDate >= DATEADD(MONTH, -1, CAST(SYSUTCDATETIME() AS DATE))) AS ReportsThisMonth,
        (SELECT COUNT(*) FROM dbo.Notifications WHERE UserId = @UserId AND IsRead = 0) AS UnreadNotifications;
END
