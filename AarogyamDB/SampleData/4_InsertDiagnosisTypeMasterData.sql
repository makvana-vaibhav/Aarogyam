-- DiagnosisTypeMaster Population Script: Cleans existing data and inserts comprehensive list of diagnoses

BEGIN TRANSACTION;
BEGIN TRY

    -- 1. Temporarily disable FK constraints on Diagnoses
    ALTER TABLE dbo.Diagnoses NOCHECK CONSTRAINT ALL;

    -- 2. Clear existing DiagnosisTypeMaster rows
    DELETE FROM dbo.DiagnosisTypeMaster;

    -- 3. Reseed identity seed to 0 (so first inserted diagnosis type gets DiagnosisTypeId = 1)
    DBCC CHECKIDENT ('dbo.DiagnosisTypeMaster', RESEED, 0);

    -- 4. Insert all DiagnosisTypeMaster records
    INSERT INTO dbo.DiagnosisTypeMaster
    (
        DiagnosisTypeName,
        Description,
        IsActive
    )
    VALUES
    ('Fever', NULL, 1),
    ('Viral Fever', NULL, 1),
    ('Common Cold', NULL, 1),
    ('Influenza (Flu)', NULL, 1),
    ('COVID-19', NULL, 1),
    ('Dengue Fever', NULL, 1),
    ('Malaria', NULL, 1),
    ('Typhoid Fever', NULL, 1),
    ('Chikungunya', NULL, 1),
    ('Tuberculosis', NULL, 1),
    ('Pneumonia', NULL, 1),
    ('Bronchitis', NULL, 1),
    ('Asthma', NULL, 1),
    ('Chronic Obstructive Pulmonary Disease (COPD)', NULL, 1),
    ('Sinusitis', NULL, 1),
    ('Tonsillitis', NULL, 1),
    ('Pharyngitis', NULL, 1),
    ('Laryngitis', NULL, 1),
    ('Ear Infection (Otitis Media)', NULL, 1),
    ('Gastroenteritis', NULL, 1),
    ('Food Poisoning', NULL, 1),
    ('Acidity (GERD)', NULL, 1),
    ('Gastritis', NULL, 1),
    ('Peptic Ulcer', NULL, 1),
    ('Constipation', NULL, 1),
    ('Diarrhea', NULL, 1),
    ('Irritable Bowel Syndrome (IBS)', NULL, 1),
    ('Hepatitis A', NULL, 1),
    ('Hepatitis B', NULL, 1),
    ('Hepatitis C', NULL, 1),
    ('Fatty Liver Disease', NULL, 1),
    ('Liver Cirrhosis', NULL, 1),
    ('Gallstones', NULL, 1),
    ('Appendicitis', NULL, 1),
    ('Pancreatitis', NULL, 1),
    ('Hypertension', NULL, 1),
    ('Hypotension', NULL, 1),
    ('Coronary Artery Disease', NULL, 1),
    ('Heart Attack (Myocardial Infarction)', NULL, 1),
    ('Heart Failure', NULL, 1),
    ('Arrhythmia', NULL, 1),
    ('Stroke', NULL, 1),
    ('High Cholesterol', NULL, 1),
    ('Varicose Veins', NULL, 1),
    ('Diabetes Mellitus Type 1', NULL, 1),
    ('Diabetes Mellitus Type 2', NULL, 1),
    ('Prediabetes', NULL, 1),
    ('Hypothyroidism', NULL, 1),
    ('Hyperthyroidism', NULL, 1),
    ('Goiter', NULL, 1),
    ('Obesity', NULL, 1),
    ('Vitamin D Deficiency', NULL, 1),
    ('Vitamin B12 Deficiency', NULL, 1),
    ('Iron Deficiency Anemia', NULL, 1),
    ('Migraine', NULL, 1),
    ('Tension Headache', NULL, 1),
    ('Epilepsy', NULL, 1),
    ('Parkinson''s Disease', NULL, 1),
    ('Alzheimer''s Disease', NULL, 1),
    ('Multiple Sclerosis', NULL, 1),
    ('Sciatica', NULL, 1),
    ('Neuropathy', NULL, 1),
    ('Vertigo', NULL, 1),
    ('Anxiety Disorder', NULL, 1),
    ('Depression', NULL, 1),
    ('Bipolar Disorder', NULL, 1),
    ('Schizophrenia', NULL, 1),
    ('Insomnia', NULL, 1),
    ('Panic Disorder', NULL, 1),
    ('Obsessive Compulsive Disorder (OCD)', NULL, 1),
    ('Acne', NULL, 1),
    ('Eczema', NULL, 1),
    ('Psoriasis', NULL, 1),
    ('Fungal Infection', NULL, 1),
    ('Ringworm', NULL, 1),
    ('Scabies', NULL, 1),
    ('Urticaria (Hives)', NULL, 1),
    ('Vitiligo', NULL, 1),
    ('Cellulitis', NULL, 1),
    ('Dermatitis', NULL, 1),
    ('Osteoarthritis', NULL, 1),
    ('Rheumatoid Arthritis', NULL, 1),
    ('Osteoporosis', NULL, 1),
    ('Gout', NULL, 1),
    ('Back Pain', NULL, 1),
    ('Neck Pain', NULL, 1),
    ('Cervical Spondylosis', NULL, 1),
    ('Lumbar Spondylosis', NULL, 1),
    ('Fracture', NULL, 1),
    ('Tennis Elbow', NULL, 1),
    ('Conjunctivitis', NULL, 1),
    ('Cataract', NULL, 1),
    ('Glaucoma', NULL, 1),
    ('Dry Eye Syndrome', NULL, 1),
    ('Refractive Error', NULL, 1),
    ('Urinary Tract Infection (UTI)', NULL, 1),
    ('Kidney Stones', NULL, 1),
    ('Chronic Kidney Disease', NULL, 1),
    ('Acute Kidney Injury', NULL, 1),
    ('Benign Prostatic Hyperplasia (BPH)', NULL, 1),
    ('Polycystic Ovary Syndrome (PCOS)', NULL, 1),
    ('Endometriosis', NULL, 1),
    ('Ovarian Cyst', NULL, 1),
    ('Uterine Fibroids', NULL, 1),
    ('Menstrual Disorders', NULL, 1),
    ('Infertility', NULL, 1),
    ('Pregnancy-Induced Hypertension', NULL, 1),
    ('Gestational Diabetes', NULL, 1),
    ('Miscarriage', NULL, 1),
    ('Menopause', NULL, 1),
    ('Dental Caries (Tooth Decay)', NULL, 1),
    ('Gingivitis', NULL, 1),
    ('Periodontitis', NULL, 1),
    ('Tooth Abscess', NULL, 1),
    ('Oral Ulcer', NULL, 1),
    ('Oral Cancer', NULL, 1),
    ('Sepsis', NULL, 1),
    ('Dehydration', NULL, 1),
    ('Heat Stroke', NULL, 1),
    ('Snake Bite', NULL, 1),
    ('Rabies', NULL, 1),
    ('HIV/AIDS', NULL, 1),
    ('Syphilis', NULL, 1),
    ('Gonorrhea', NULL, 1),
    ('Herpes Simplex Infection', NULL, 1),
    ('Chickenpox', NULL, 1),
    ('Measles', NULL, 1),
    ('Mumps', NULL, 1),
    ('Rubella', NULL, 1),
    ('Cholera', NULL, 1),
    ('Leptospirosis', NULL, 1),
    ('Jaundice', NULL, 1),
    ('Blood Cancer (Leukemia)', NULL, 1),
    ('Lymphoma', NULL, 1),
    ('Breast Cancer', NULL, 1),
    ('Cervical Cancer', NULL, 1),
    ('Lung Cancer', NULL, 1),
    ('Colon Cancer', NULL, 1),
    ('Prostate Cancer', NULL, 1),
    ('Liver Cancer', NULL, 1),
    ('Brain Tumor', NULL, 1),
    ('Thyroid Cancer', NULL, 1),
    ('Skin Cancer', NULL, 1),
    ('Pancreatic Cancer', NULL, 1),
    ('Ovarian Cancer', NULL, 1),
    ('Kidney Cancer', NULL, 1),
    ('Bladder Cancer', NULL, 1),
    ('Oral Cancer', NULL, 1),
    ('Stomach Cancer', NULL, 1),
    ('Esophageal Cancer', NULL, 1);

    -- 5. Sync Diagnoses table references to valid Fever DiagnosisTypeId (1)
    DECLARE @FeverTypeId INT;
    SELECT TOP 1 @FeverTypeId = DiagnosisTypeId FROM dbo.DiagnosisTypeMaster WHERE DiagnosisTypeName = 'Fever';

    UPDATE dbo.Diagnoses SET DiagnosisTypeId = @FeverTypeId WHERE DiagnosisTypeId IS NOT NULL;

    -- 6. Re-enable & verify FK constraints
    ALTER TABLE dbo.Diagnoses WITH CHECK CHECK CONSTRAINT ALL;

    COMMIT TRANSACTION;
    PRINT 'SUCCESS: DiagnosisTypeMaster cleared and repopulated starting at DiagnosisTypeId 1.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@ErrMsg, 16, 1);
END CATCH;
