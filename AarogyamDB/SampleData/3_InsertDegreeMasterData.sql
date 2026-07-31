-- DegreeMaster Population Script: Cleans existing data and inserts 44 medical degrees

BEGIN TRANSACTION;
BEGIN TRY

    -- 1. Temporarily disable FK constraints on Doctors
    ALTER TABLE dbo.Doctors NOCHECK CONSTRAINT ALL;

    -- 2. Clear existing DegreeMaster rows
    DELETE FROM dbo.DegreeMaster;

    -- 3. Reseed identity seed to 0 (so first inserted degree gets DegreeId = 1)
    DBCC CHECKIDENT ('dbo.DegreeMaster', RESEED, 0);

    -- 4. Insert all 44 DegreeMaster records
    INSERT INTO dbo.DegreeMaster (DegreeName, ShortName, Description)
    VALUES
    ('Bachelor of Ayurvedic Medicine and Surgery', 'BAMS', NULL),
    ('Bachelor of Dental Surgery', 'BDS', NULL),
    ('Bachelor of Homeopathic Medicine and Surgery', 'BHMS', NULL),
    ('Bachelor of Naturopathy and Yogic Sciences', 'BNYS', NULL),
    ('Bachelor of Siddha Medicine and Surgery', 'BSMS', NULL),
    ('Bachelor of Unani Medicine and Surgery', 'BUMS', NULL),
    ('Diploma in Anaesthesia', 'D.A.', NULL),
    ('Diploma in Child Health', 'D.C.H.', NULL),
    ('Diploma in Gynaecology and Obstetrics', 'D.G.O.', NULL),
    ('Diploma in Laryngology and Otology', 'D.L.O.', NULL),
    ('Diploma in Medical Radiodiagnosis', 'D.M.R.D.', NULL),
    ('Diploma in Medical Radiotherapy', 'D.M.R.T.', NULL),
    ('Diploma in Ophthalmology', 'D.O.', NULL),
    ('Diploma in Orthopaedics', 'D.Ortho', NULL),
    ('Diploma in Public Health', 'D.P.H.', NULL),
    ('Diploma in Psychological Medicine', 'D.P.M.', NULL),
    ('Diploma in Tuberculosis and Chest Diseases', 'D.T.C.D.', NULL),
    ('Diplomate of National Board', 'DNB', NULL),
    ('Doctorate of Medicine (Super Speciality)', 'DM', NULL),
    ('Doctorate of National Board', 'DrNB', NULL),
    ('Fellow of the American College of Cardiology', 'FACC', NULL),
    ('Fellow of the Association of Indian Surgeons', 'FAIS', NULL),
    ('Fellow of the International College of Surgeons', 'FICS', NULL),
    ('Fellow of the Indian Academy of Medical Specialists', 'FIAMS', NULL),
    ('Fellow of National Board', 'FNB', NULL),
    ('Fellow of the Royal College of Physicians', 'FRCP', NULL),
    ('Fellow of the Royal College of Surgeons', 'FRCS', NULL),
    ('Bachelor of Medicine, Bachelor of Surgery', 'MBBS', NULL),
    ('Master of Chirurgiae (Super Speciality Surgery)', 'M.Ch.', NULL),
    ('Doctor of Medicine', 'MD', NULL),
    ('Doctor of Medicine in Ayurveda', 'MD (Ayurveda)', NULL),
    ('Doctor of Medicine in Homeopathy', 'MD (Homeopathy)', NULL),
    ('Doctor of Medicine in Naturopathy', 'MD (Naturopathy)', NULL),
    ('Doctor of Medicine in Siddha', 'MD (Siddha)', NULL),
    ('Doctor of Medicine in Unani', 'MD (Unani)', NULL),
    ('Master of Dental Surgery', 'MDS', NULL),
    ('Master of Hospital Administration', 'MHA', NULL),
    ('Master of Public Health', 'MPH', NULL),
    ('Member of the Royal College of Physicians', 'MRCP', NULL),
    ('Member of the Royal College of Surgeons', 'MRCS', NULL),
    ('Master of Surgery', 'MS', NULL),
    ('Master of Surgery in Ayurveda', 'MS (Ayurveda)', NULL),
    ('Doctor of Philosophy', 'Ph.D.', NULL),
    ('Post-Doctoral Fellowship', 'PDF', NULL);

    -- 5. Sync Doctors table to valid MBBS DegreeId
    DECLARE @MbbsDegreeId INT;
    SELECT @MbbsDegreeId = DegreeId FROM dbo.DegreeMaster WHERE ShortName = 'MBBS';

    UPDATE dbo.Doctors SET DegreeId = @MbbsDegreeId WHERE DegreeId IS NOT NULL;

    -- 6. Re-enable & verify FK constraints
    ALTER TABLE dbo.Doctors WITH CHECK CHECK CONSTRAINT ALL;

    COMMIT TRANSACTION;
    PRINT 'SUCCESS: DegreeMaster cleared and repopulated with 44 medical degrees starting at DegreeId 1.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@ErrMsg, 16, 1);
END CATCH;
