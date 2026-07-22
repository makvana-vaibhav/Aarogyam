CREATE OR ALTER PROCEDURE dbo.spAdminDashboardStats
AS
BEGIN
    SELECT
        (SELECT COUNT(*) FROM dbo.Users) AS TotalUsers,
        (SELECT COUNT(*) FROM dbo.Patients) AS TotalPatients,
        (SELECT COUNT(*) FROM dbo.Doctors) AS TotalDoctors,
        (SELECT COUNT(*) FROM dbo.Doctors WHERE ApprovalStatus = 'Pending') AS PendingDoctorApprovals,
        (SELECT COUNT(*) FROM dbo.HospitalMaster) AS TotalHospitals,
        (SELECT COUNT(*) FROM dbo.Visits) AS TotalVisits;
END
