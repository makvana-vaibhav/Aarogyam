CREATE OR ALTER PROCEDURE dbo.spHospitalMasterGet
    @HospitalId INT = NULL
AS
BEGIN
    IF @HospitalId IS NULL
        SELECT * FROM dbo.HospitalMaster;
    ELSE
        SELECT * FROM dbo.HospitalMaster WHERE HospitalId = @HospitalId;
END
