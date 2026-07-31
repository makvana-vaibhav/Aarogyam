-- SpecializationMaster Population Script: Cleans existing data and inserts 50 medical specializations

BEGIN TRANSACTION;
BEGIN TRY

    -- 1. Temporarily disable FK constraints on Doctors
    ALTER TABLE dbo.Doctors NOCHECK CONSTRAINT ALL;

    -- 2. Clear existing SpecializationMaster rows
    DELETE FROM dbo.SpecializationMaster;

    -- 3. Reseed identity seed to 0 (so first inserted specialization gets SpecializationId = 1)
    DBCC CHECKIDENT ('dbo.SpecializationMaster', RESEED, 0);

    -- 4. Insert all 50 SpecializationMaster records
    INSERT INTO dbo.SpecializationMaster (SpecializationName) VALUES
    ('General Physician'),
    ('General Surgeon'),
    ('Cardiologist'),
    ('Cardiothoracic Surgeon'),
    ('Neurologist'),
    ('Neurosurgeon'),
    ('Orthopedic Surgeon'),
    ('Pediatrician'),
    ('Pediatric Surgeon'),
    ('Gynecologist & Obstetrician'),
    ('Dermatologist'),
    ('Ophthalmologist'),
    ('ENT Specialist (Otolaryngologist)'),
    ('Dentist'),
    ('Oral & Maxillofacial Surgeon'),
    ('Urologist'),
    ('Nephrologist'),
    ('Gastroenterologist'),
    ('Hepatologist'),
    ('Pulmonologist'),
    ('Endocrinologist'),
    ('Oncologist'),
    ('Radiation Oncologist'),
    ('Hematologist'),
    ('Rheumatologist'),
    ('Psychiatrist'),
    ('Psychologist'),
    ('Anesthesiologist'),
    ('Radiologist'),
    ('Pathologist'),
    ('Emergency Medicine Specialist'),
    ('Critical Care Specialist'),
    ('Infectious Disease Specialist'),
    ('Immunologist'),
    ('Plastic Surgeon'),
    ('Cosmetic Surgeon'),
    ('Vascular Surgeon'),
    ('Nuclear Medicine Specialist'),
    ('Sports Medicine Specialist'),
    ('Pain Management Specialist'),
    ('Geriatrician'),
    ('Neonatologist'),
    ('Reproductive Medicine Specialist'),
    ('Family Medicine Specialist'),
    ('Palliative Care Specialist'),
    ('Occupational Medicine Specialist'),
    ('Community Medicine Specialist'),
    ('Preventive Medicine Specialist'),
    ('Medical Geneticist'),
    ('Allergy & Asthma Specialist');

    -- 5. Sync Doctors table references to valid SpecializationId (1 - General Physician)
    DECLARE @DefaultSpecId INT;
    SELECT TOP 1 @DefaultSpecId = SpecializationId FROM dbo.SpecializationMaster WHERE SpecializationName = 'General Physician';

    UPDATE dbo.Doctors SET SpecializationId = @DefaultSpecId WHERE SpecializationId IS NOT NULL;

    -- 6. Re-enable & verify FK constraints
    ALTER TABLE dbo.Doctors WITH CHECK CHECK CONSTRAINT ALL;

    COMMIT TRANSACTION;
    PRINT 'SUCCESS: SpecializationMaster cleared and repopulated starting at SpecializationId 1.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@ErrMsg, 16, 1);
END CATCH;
