-- Master Data Population Script: Country, State, and City Master Data for India & Gujarat

BEGIN TRANSACTION;
BEGIN TRY

    -- 1. Temporarily disable FK constraints
    ALTER TABLE dbo.Patients NOCHECK CONSTRAINT ALL;
    ALTER TABLE dbo.Doctors NOCHECK CONSTRAINT ALL;
    ALTER TABLE dbo.HospitalMaster NOCHECK CONSTRAINT ALL;
    ALTER TABLE dbo.CityMaster NOCHECK CONSTRAINT ALL;
    ALTER TABLE dbo.StateMaster NOCHECK CONSTRAINT ALL;

    -- 2. Clear existing master tables
    DELETE FROM dbo.CityMaster;
    DELETE FROM dbo.StateMaster;
    DELETE FROM dbo.CountryMaster;

    -- 3. Reseed identity seeds starting at 0 (so first inserted record gets ID = 1)
    DBCC CHECKIDENT ('dbo.CountryMaster', RESEED, 0);
    DBCC CHECKIDENT ('dbo.StateMaster', RESEED, 0);
    DBCC CHECKIDENT ('dbo.CityMaster', RESEED, 0);

    -- 4. Insert Country (India) -> CountryId = 1
    INSERT INTO dbo.CountryMaster (CountryName, CountryCode, IsActive)
    VALUES ('India', 'IN', 1);

    -- 5. Insert States & Union Territories (36 Total)
    INSERT INTO dbo.StateMaster (CountryId, StateName)
    VALUES
    (1, 'Andhra Pradesh'),
    (1, 'Arunachal Pradesh'),
    (1, 'Assam'),
    (1, 'Bihar'),
    (1, 'Chhattisgarh'),
    (1, 'Goa'),
    (1, 'Gujarat'),
    (1, 'Haryana'),
    (1, 'Himachal Pradesh'),
    (1, 'Jharkhand'),
    (1, 'Karnataka'),
    (1, 'Kerala'),
    (1, 'Madhya Pradesh'),
    (1, 'Maharashtra'),
    (1, 'Manipur'),
    (1, 'Meghalaya'),
    (1, 'Mizoram'),
    (1, 'Nagaland'),
    (1, 'Odisha'),
    (1, 'Punjab'),
    (1, 'Rajasthan'),
    (1, 'Sikkim'),
    (1, 'Tamil Nadu'),
    (1, 'Telangana'),
    (1, 'Tripura'),
    (1, 'Uttar Pradesh'),
    (1, 'Uttarakhand'),
    (1, 'West Bengal'),
    (1, 'Andaman and Nicobar Islands'),
    (1, 'Chandigarh'),
    (1, 'Dadra and Nagar Haveli and Daman and Diu'),
    (1, 'Delhi'),
    (1, 'Jammu and Kashmir'),
    (1, 'Ladakh'),
    (1, 'Lakshadweep'),
    (1, 'Puducherry');

    -- Retrieve Gujarat StateId
    DECLARE @GujaratStateId INT;
    SELECT @GujaratStateId = StateId FROM dbo.StateMaster WHERE StateName = 'Gujarat';

    -- 6. Insert Cities of Gujarat into CityMaster
    INSERT INTO dbo.CityMaster (StateId, CityName)
    VALUES
    (@GujaratStateId, 'Ahmedabad'),
    (@GujaratStateId, 'Amreli'),
    (@GujaratStateId, 'Anand'),
    (@GujaratStateId, 'Ankleshwar'),
    (@GujaratStateId, 'Bardoli'),
    (@GujaratStateId, 'Bharuch'),
    (@GujaratStateId, 'Bhavnagar'),
    (@GujaratStateId, 'Bhuj'),
    (@GujaratStateId, 'Botad'),
    (@GujaratStateId, 'Dahod'),
    (@GujaratStateId, 'Deesa'),
    (@GujaratStateId, 'Dhoraji'),
    (@GujaratStateId, 'Dwarka'),
    (@GujaratStateId, 'Gandhidham'),
    (@GujaratStateId, 'Gandhinagar'),
    (@GujaratStateId, 'Godhra'),
    (@GujaratStateId, 'Gondal'),
    (@GujaratStateId, 'Himatnagar'),
    (@GujaratStateId, 'Jamnagar'),
    (@GujaratStateId, 'Jetpur'),
    (@GujaratStateId, 'Junagadh'),
    (@GujaratStateId, 'Kadi'),
    (@GujaratStateId, 'Mandvi'),
    (@GujaratStateId, 'Mehsana'),
    (@GujaratStateId, 'Modasa'),
    (@GujaratStateId, 'Morbi'),
    (@GujaratStateId, 'Nadiad'),
    (@GujaratStateId, 'Navsari'),
    (@GujaratStateId, 'Palanpur'),
    (@GujaratStateId, 'Palitana'),
    (@GujaratStateId, 'Patan'),
    (@GujaratStateId, 'Porbandar'),
    (@GujaratStateId, 'Rajkot'),
    (@GujaratStateId, 'Sanand'),
    (@GujaratStateId, 'Siddhpur'),
    (@GujaratStateId, 'Somnath'),
    (@GujaratStateId, 'Surendranagar'),
    (@GujaratStateId, 'Surat'),
    (@GujaratStateId, 'Unjha'),
    (@GujaratStateId, 'Vadodara'),
    (@GujaratStateId, 'Valsad'),
    (@GujaratStateId, 'Vapi'),
    (@GujaratStateId, 'Veraval'),
    (@GujaratStateId, 'Vyara'),
    (@GujaratStateId, 'Wadhwan');

    -- Get Default City ID (Rajkot or first available Gujarat city)
    DECLARE @DefaultCityId INT;
    SELECT @DefaultCityId = CityId FROM dbo.CityMaster WHERE StateId = @GujaratStateId AND CityName = 'Rajkot';
    IF @DefaultCityId IS NULL
    BEGIN
        SELECT TOP 1 @DefaultCityId = CityId FROM dbo.CityMaster WHERE StateId = @GujaratStateId;
    END

    -- 7. Sync existing HospitalMaster, Patients, and Doctors references to valid new State & City IDs
    UPDATE dbo.HospitalMaster SET CityId = @DefaultCityId WHERE CityId IS NOT NULL;
    UPDATE dbo.Patients SET CountryId = 1, StateId = @GujaratStateId, CityId = @DefaultCityId WHERE CountryId IS NOT NULL;
    UPDATE dbo.Doctors SET CountryId = 1, StateId = @GujaratStateId, CityId = @DefaultCityId WHERE CountryId IS NOT NULL;

    -- 8. Re-enable & verify FK constraints
    ALTER TABLE dbo.CityMaster WITH CHECK CHECK CONSTRAINT ALL;
    ALTER TABLE dbo.StateMaster WITH CHECK CHECK CONSTRAINT ALL;
    ALTER TABLE dbo.HospitalMaster WITH CHECK CHECK CONSTRAINT ALL;
    ALTER TABLE dbo.Patients WITH CHECK CHECK CONSTRAINT ALL;
    ALTER TABLE dbo.Doctors WITH CHECK CHECK CONSTRAINT ALL;

    COMMIT TRANSACTION;
    PRINT 'SUCCESS: Master data cleaned and inserted starting at Country ID 1, 36 States, and Gujarat Cities.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@ErrMsg, 16, 1);
END CATCH;
