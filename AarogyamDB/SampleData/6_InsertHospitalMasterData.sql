-- HospitalMaster Population Script: Cleans existing data and inserts 50 hospitals with CityId resolution

BEGIN TRANSACTION;
BEGIN TRY

    -- 1. Temporarily disable FK constraints on Doctors
    ALTER TABLE dbo.Doctors NOCHECK CONSTRAINT ALL;

    -- 2. Clear existing HospitalMaster rows
    DELETE FROM dbo.HospitalMaster;

    -- 3. Reseed identity seed to 0 (so first inserted hospital gets HospitalId = 1)
    DBCC CHECKIDENT ('dbo.HospitalMaster', RESEED, 0);

    -- Get Gujarat StateId
    DECLARE @GujaratStateId INT;
    SELECT @GujaratStateId = StateId FROM dbo.StateMaster WHERE StateName = 'Gujarat';

    -- Ensure Karamsad exists in CityMaster under Gujarat
    IF NOT EXISTS (SELECT 1 FROM dbo.CityMaster WHERE CityName = 'Karamsad' AND StateId = @GujaratStateId)
    BEGIN
        INSERT INTO dbo.CityMaster (StateId, CityName) VALUES (@GujaratStateId, 'Karamsad');
    END

    -- Temporary table to hold input (HospitalName, CityName)
    CREATE TABLE #TempHospitals (
        Id INT IDENTITY(1,1),
        HospitalName NVARCHAR(150),
        CityName NVARCHAR(100)
    );

    INSERT INTO #TempHospitals (HospitalName, CityName) VALUES
    ('Marengo CIMS Hospital','Ahmedabad'),
    ('Zydus Hospitals','Ahmedabad'),
    ('Sterling Hospitals','Ahmedabad'),
    ('Shalby Hospital','Ahmedabad'),
    ('HCG Cancer Centre','Ahmedabad'),
    ('Apollo Hospital','Gandhinagar'),
    ('Narayana Multispeciality Hospital','Ahmedabad'),
    ('SAL Hospital','Ahmedabad'),
    ('KD Hospital','Ahmedabad'),
    ('SGVP Holistic Hospital','Ahmedabad'),
    ('BAPS Yogiji Maharaj Hospital','Ahmedabad'),
    ('UN Mehta Institute of Cardiology & Research Centre','Ahmedabad'),
    ('Gujarat Cancer & Research Institute (GCRI)','Ahmedabad'),
    ('IKDRC-ITS','Ahmedabad'),
    ('Civil Hospital Ahmedabad','Ahmedabad'),
    ('Rajasthan Hospital','Ahmedabad'),
    ('Lifeline Multispeciality Hospital','Ahmedabad'),
    ('Nidhi Hospital','Ahmedabad'),
    ('Krishna Shalby Hospital','Ahmedabad'),
    ('Apex Heart Institute','Ahmedabad'),
    ('Aadicura Superspeciality Hospital','Vadodara'),
    ('Bhailal Amin General Hospital','Vadodara'),
    ('Gujarat Kidney Hospital','Vadodara'),
    ('Sunshine Global Hospital','Vadodara'),
    ('Metro Hospital & Research Institute','Vadodara'),
    ('Baroda Hospital','Vadodara'),
    ('Parul Sevashram Hospital','Vadodara'),
    ('Sterling Hospital','Vadodara'),
    ('Kiran Multi Super Speciality Hospital','Surat'),
    ('Sunshine Global Hospital','Surat'),
    ('SMIMER Hospital','Surat'),
    ('New Civil Hospital','Surat'),
    ('Mahavir Hospital','Surat'),
    ('Apple Hospital','Surat'),
    ('Shalby Hospital','Surat'),
    ('Unity Hospital','Surat'),
    ('Wockhardt Hospital','Rajkot'),
    ('Sterling Hospital','Rajkot'),
    ('HCG Hospitals','Rajkot'),
    ('Synergy Hospital','Rajkot'),
    ('Christ Hospital','Rajkot'),
    ('Pandit Deendayal Upadhyay Government Hospital','Rajkot'),
    ('AIIMS Rajkot','Rajkot'),
    ('Muljibhai Patel Urological Hospital','Nadiad'),
    ('Shree Krishna Hospital','Karamsad'),
    ('Haria L.G. Rotary Hospital','Vapi'),
    ('GMERS Medical College & Hospital','Gandhinagar'),
    ('Guru Gobind Singh Hospital','Jamnagar'),
    ('Government Medical College Hospital','Bhavnagar'),
    ('GMERS Medical College & Hospital','Junagadh');

    -- Insert into HospitalMaster resolving CityId from CityMaster
    INSERT INTO dbo.HospitalMaster (HospitalName, Address, CityId, PhoneNumber, Email, IsActive)
    SELECT 
        th.HospitalName,
        th.CityName AS Address,
        c.CityId,
        NULL AS PhoneNumber,
        NULL AS Email,
        1 AS IsActive
    FROM #TempHospitals th
    INNER JOIN dbo.CityMaster c ON c.CityName = th.CityName AND c.StateId = @GujaratStateId
    ORDER BY th.Id;

    DROP TABLE #TempHospitals;

    -- 5. Sync Doctors table references to valid HospitalId (1)
    DECLARE @DefaultHospitalId INT;
    SELECT TOP 1 @DefaultHospitalId = HospitalId FROM dbo.HospitalMaster ORDER BY HospitalId;

    UPDATE dbo.Doctors SET HospitalId = @DefaultHospitalId WHERE HospitalId IS NOT NULL;

    -- 6. Re-enable & verify FK constraints
    ALTER TABLE dbo.Doctors WITH CHECK CHECK CONSTRAINT ALL;

    COMMIT TRANSACTION;
    PRINT 'SUCCESS: HospitalMaster cleared and repopulated starting at HospitalId 1.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@ErrMsg, 16, 1);
END CATCH;
