-- Operational Data Cleanup Script: Removes operational records (patients, doctors, visits, prescriptions, reports, etc.) while preserving Master Data and the Admin account

BEGIN TRANSACTION;
BEGIN TRY

    -- 1. Delete dependent operational records
    DELETE FROM dbo.AuditLogs;
    DELETE FROM dbo.Notifications;
    DELETE FROM dbo.MedicalReports;
    DELETE FROM dbo.Prescriptions;
    DELETE FROM dbo.Diagnoses;
    DELETE FROM dbo.Visits;
    DELETE FROM dbo.OTPMaster;
    DELETE FROM dbo.Patients;
    DELETE FROM dbo.Doctors;

    -- 2. Delete all non-admin users (retaining single Admin user with RoleId = 3)
    DELETE FROM dbo.Users WHERE RoleId <> 3;

    -- 3. Reseed identity values for cleared operational tables
    DBCC CHECKIDENT ('dbo.AuditLogs', RESEED, 0);
    DBCC CHECKIDENT ('dbo.Notifications', RESEED, 0);
    DBCC CHECKIDENT ('dbo.MedicalReports', RESEED, 0);
    DBCC CHECKIDENT ('dbo.Prescriptions', RESEED, 0);
    DBCC CHECKIDENT ('dbo.Diagnoses', RESEED, 0);
    DBCC CHECKIDENT ('dbo.Visits', RESEED, 0);
    DBCC CHECKIDENT ('dbo.OTPMaster', RESEED, 0);
    DBCC CHECKIDENT ('dbo.Patients', RESEED, 0);
    DBCC CHECKIDENT ('dbo.Doctors', RESEED, 0);

    COMMIT TRANSACTION;
    PRINT 'SUCCESS: Operational data cleaned. Master data preserved and Admin account retained.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@ErrMsg, 16, 1);
END CATCH;
