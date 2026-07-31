-- Script to create 5 Active Verified Patients & 5 Active Approved Doctors with meaningful Clinical Data (Visits, Diagnoses, Prescriptions, Reports, Notifications)

BEGIN TRANSACTION;
BEGIN TRY

    DECLARE @PassHash NVARCHAR(255) = '$2a$11$HFtVEsyNOrhKLR.zu/LT2ubazvVrptFQMZEZfDAnT79R2qwMlHQs2';
    DECLARE @AdminUserId INT = 1; -- Admin user ID

    -------------------------------------------------------------------
    -- 1. INSERT 5 DOCTORS (Users + Doctors table)
    -------------------------------------------------------------------

    -- Doctor 1: Dr. Rajesh Varma (Cardiologist - CIMS Ahmedabad)
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (2, 'dr.rajesh.varma@aarogyam.com', '9825011001', @PassHash, 1, 1);
    DECLARE @DocUser1 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Doctors (UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId, SpecializationId, LicenseDocumentPath, DegreeDocumentPath, ApprovalStatus, ApprovedByUserId, ApprovedAt, Address, CountryId, StateId, CityId)
    VALUES (@DocUser1, 'Rajesh', 'Kumar', 'Varma', 'MCI-G-44210', 1, 30, 3, '/docs/license_rajesh.pdf', '/docs/degree_rajesh.pdf', 'Approved', @AdminUserId, SYSUTCDATETIME(), 'Satellite, Ahmedabad', 1, 7, 1);
    DECLARE @Doc1 INT = SCOPE_IDENTITY();

    -- Doctor 2: Dr. Priyanjali Patel (Gynecologist - Zydus Ahmedabad)
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (2, 'dr.priyanjali.patel@aarogyam.com', '9825011002', @PassHash, 1, 1);
    DECLARE @DocUser2 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Doctors (UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId, SpecializationId, LicenseDocumentPath, DegreeDocumentPath, ApprovalStatus, ApprovedByUserId, ApprovedAt, Address, CountryId, StateId, CityId)
    VALUES (@DocUser2, 'Priyanjali', 'R', 'Patel', 'MCI-G-51204', 2, 41, 10, '/docs/license_priyanjali.pdf', '/docs/degree_priyanjali.pdf', 'Approved', @AdminUserId, SYSUTCDATETIME(), 'Thaltej, Ahmedabad', 1, 7, 1);
    DECLARE @Doc2 INT = SCOPE_IDENTITY();

    -- Doctor 3: Dr. Aniket Shah (Orthopedic Surgeon - Wockhardt Rajkot)
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (2, 'dr.aniket.shah@aarogyam.com', '9825011003', @PassHash, 1, 1);
    DECLARE @DocUser3 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Doctors (UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId, SpecializationId, LicenseDocumentPath, DegreeDocumentPath, ApprovalStatus, ApprovedByUserId, ApprovedAt, Address, CountryId, StateId, CityId)
    VALUES (@DocUser3, 'Aniket', 'M', 'Shah', 'MCI-G-38912', 37, 14, 7, '/docs/license_aniket.pdf', '/docs/degree_aniket.pdf', 'Approved', @AdminUserId, SYSUTCDATETIME(), 'Kalawad Road, Rajkot', 1, 7, 33);
    DECLARE @Doc3 INT = SCOPE_IDENTITY();

    -- Doctor 4: Dr. Sunita Mehta (Pediatrician - Kiran Hospital Surat)
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (2, 'dr.sunita.mehta@aarogyam.com', '9825011004', @PassHash, 1, 1);
    DECLARE @DocUser4 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Doctors (UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId, SpecializationId, LicenseDocumentPath, DegreeDocumentPath, ApprovalStatus, ApprovedByUserId, ApprovedAt, Address, CountryId, StateId, CityId)
    VALUES (@DocUser4, 'Sunita', 'D', 'Mehta', 'MCI-G-62109', 29, 8, 8, '/docs/license_sunita.pdf', '/docs/degree_sunita.pdf', 'Approved', @AdminUserId, SYSUTCDATETIME(), 'Ring Road, Surat', 1, 7, 38);
    DECLARE @Doc4 INT = SCOPE_IDENTITY();

    -- Doctor 5: Dr. Hardik Joshi (General Physician - Bhailal Amin Vadodara)
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (2, 'dr.hardik.joshi@aarogyam.com', '9825011005', @PassHash, 1, 1);
    DECLARE @DocUser5 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Doctors (UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId, SpecializationId, LicenseDocumentPath, DegreeDocumentPath, ApprovalStatus, ApprovedByUserId, ApprovedAt, Address, CountryId, StateId, CityId)
    VALUES (@DocUser5, 'Hardik', 'V', 'Joshi', 'MCI-G-29801', 22, 30, 1, '/docs/license_hardik.pdf', '/docs/degree_hardik.pdf', 'Approved', @AdminUserId, SYSUTCDATETIME(), 'Gorwa, Vadodara', 1, 7, 40);
    DECLARE @Doc5 INT = SCOPE_IDENTITY();

    -------------------------------------------------------------------
    -- 2. INSERT 5 PATIENTS (Users + Patients table)
    -------------------------------------------------------------------

    -- Patient 1: Aarav Sharma (Ahmedabad)
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (1, 'aarav.sharma@aarogyam.com', '9909012001', @PassHash, 1, 1);
    DECLARE @PatUser1 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Patients (UserId, AarogyamId, FirstName, MiddleName, LastName, DateOfBirth, Gender, BloodGroup, Address, CountryId, StateId, CityId, EmergencyContact)
    VALUES (@PatUser1, 'AAR-2026-8849', 'Aarav', 'N', 'Sharma', '1992-05-15', 'Male', 'O+', 'Vastrapur, Ahmedabad', 1, 7, 1, '9909099901');
    DECLARE @Pat1 INT = SCOPE_IDENTITY();

    -- Patient 2: Kavya Trivedi (Ahmedabad)
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (1, 'kavya.trivedi@aarogyam.com', '9909012002', @PassHash, 1, 1);
    DECLARE @PatUser2 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Patients (UserId, AarogyamId, FirstName, MiddleName, LastName, DateOfBirth, Gender, BloodGroup, Address, CountryId, StateId, CityId, EmergencyContact)
    VALUES (@PatUser2, 'AAR-2026-9102', 'Kavya', 'S', 'Trivedi', '1995-11-20', 'Female', 'B+', 'Bodakdev, Ahmedabad', 1, 7, 1, '9909099902');
    DECLARE @Pat2 INT = SCOPE_IDENTITY();

    -- Patient 3: Devendra Parmar (Rajkot)
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (1, 'devendra.parmar@aarogyam.com', '9909012003', @PassHash, 1, 1);
    DECLARE @PatUser3 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Patients (UserId, AarogyamId, FirstName, MiddleName, LastName, DateOfBirth, Gender, BloodGroup, Address, CountryId, StateId, CityId, EmergencyContact)
    VALUES (@PatUser3, 'AAR-2026-3401', 'Devendra', 'K', 'Parmar', '1968-08-10', 'Male', 'A+', 'University Road, Rajkot', 1, 7, 33, '9909099903');
    DECLARE @Pat3 INT = SCOPE_IDENTITY();

    -- Patient 4: Meera Solanki (Surat)
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (1, 'meera.solanki@aarogyam.com', '9909012004', @PassHash, 1, 1);
    DECLARE @PatUser4 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Patients (UserId, AarogyamId, FirstName, MiddleName, LastName, DateOfBirth, Gender, BloodGroup, Address, CountryId, StateId, CityId, EmergencyContact)
    VALUES (@PatUser4, 'AAR-2026-7284', 'Meera', 'P', 'Solanki', '2001-03-25', 'Female', 'AB+', 'Adajan, Surat', 1, 7, 38, '9909099904');
    DECLARE @Pat4 INT = SCOPE_IDENTITY();

    -- Patient 5: Vikram Desai (Vadodara)
    INSERT INTO dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
    VALUES (1, 'vikram.desai@aarogyam.com', '9909012005', @PassHash, 1, 1);
    DECLARE @PatUser5 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Patients (UserId, AarogyamId, FirstName, MiddleName, LastName, DateOfBirth, Gender, BloodGroup, Address, CountryId, StateId, CityId, EmergencyContact)
    VALUES (@PatUser5, 'AAR-2026-5510', 'Vikram', 'H', 'Desai', '1985-12-05', 'Male', 'B-', 'Alkapuri, Vadodara', 1, 7, 40, '9909099905');
    DECLARE @Pat5 INT = SCOPE_IDENTITY();


    -------------------------------------------------------------------
    -- 3. INSERT CLINICAL VISITS, DIAGNOSES, PRESCRIPTIONS, & REPORTS
    -------------------------------------------------------------------

    -- Visit 1: Aarav Sharma with Dr. Rajesh Varma (Hypertension)
    INSERT INTO dbo.Visits (PatientId, DoctorId, VisitDate, Notes)
    VALUES (@Pat1, @Doc1, '2026-07-10 10:30', 'Patient presented with mild chest tightness and elevated blood pressure during routine stress test.');
    DECLARE @V1 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Diagnoses (VisitId, DiagnosisTypeId, DiagnosisTitle, Description, DiagnosisDate)
    VALUES (@V1, 36, 'Essential Stage-1 Hypertension', 'Sustained BP reading 142/92 mmHg. Advised low sodium diet, regular daily aerobic exercise, and anti-hypertensive therapy.', '2026-07-10');
    DECLARE @D1 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
    VALUES (@V1, @D1, 'Telmisartan 40mg - Take 1 tablet once daily in the morning after breakfast. Follow up after 4 weeks with BP log.', '/pdfs/prescription_aarav_hypertension.pdf', '2026-07-10');

    INSERT INTO dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId, Title, ReportType, FilePath, FileSize, ReportDate)
    VALUES (@V1, @D1, @Pat1, @Doc1, @DocUser1, 'ECG & Lipid Profile Panel', 'LabReport', '/reports/lipid_ecg_aarav.pdf', 285000, '2026-07-10');


    -- Visit 2: Devendra Parmar with Dr. Rajesh Varma (Coronary Artery Disease)
    INSERT INTO dbo.Visits (PatientId, DoctorId, VisitDate, Notes)
    VALUES (@Pat3, @Doc1, '2026-07-18 14:15', 'Follow-up consultation for coronary evaluation and exertional dyspnea.');
    DECLARE @V2 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Diagnoses (VisitId, DiagnosisTypeId, DiagnosisTitle, Description, DiagnosisDate)
    VALUES (@V2, 38, 'Mild Coronary Artery Disease', '2D Echocardiogram shows normal LVEF 60% with mild grade-1 diastolic dysfunction.', '2026-07-18');
    DECLARE @D2 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
    VALUES (@V2, @D2, 'Atorvastatin 20mg once daily at bedtime. Aspirin 75mg once daily after lunch. Follow up in 3 months.', '/pdfs/prescription_devendra_cad.pdf', '2026-07-18');

    INSERT INTO dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId, Title, ReportType, FilePath, FileSize, ReportDate)
    VALUES (@V2, @D2, @Pat3, @Doc1, @DocUser1, '2D Echocardiography Report', 'LabReport', '/reports/echo_2d_devendra.pdf', 312000, '2026-07-18');


    -- Visit 3: Kavya Trivedi with Dr. Priyanjali Patel (Gestational Diabetes)
    INSERT INTO dbo.Visits (PatientId, DoctorId, VisitDate, Notes)
    VALUES (@Pat2, @Doc2, '2026-07-12 11:00', 'Routine antenatal checkup at 24 weeks gestation. Fetal heart rate regular.');
    DECLARE @V3 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Diagnoses (VisitId, DiagnosisTypeId, DiagnosisTitle, Description, DiagnosisDate)
    VALUES (@V3, 108, 'Mild Gestational Diabetes Mellitus', '75g OGTT 2-hour blood glucose 156 mg/dL. Referred for clinical nutrition and blood sugar monitoring.', '2026-07-12');
    DECLARE @D3 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
    VALUES (@V3, @D3, 'Iron & Folic Acid 1 tablet daily after lunch. Calcium Citrate 500mg 1 tablet daily after dinner. Dietary sugar restriction.', '/pdfs/prescription_kavya_gdm.pdf', '2026-07-12');

    INSERT INTO dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId, Title, ReportType, FilePath, FileSize, ReportDate)
    VALUES (@V3, @D3, @Pat2, @Doc2, @DocUser2, 'Anomaly Ultrasound Scan (24 Weeks)', 'Scan', '/reports/usg_anomaly_kavya.pdf', 450000, '2026-07-12');


    -- Visit 4: Devendra Parmar with Dr. Aniket Shah (Osteoarthritis)
    INSERT INTO dbo.Visits (PatientId, DoctorId, VisitDate, Notes)
    VALUES (@Pat3, @Doc3, '2026-07-22 16:00', 'Chronic right knee joint pain aggravated by stair climbing and prolonged standing.');
    DECLARE @V4 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Diagnoses (VisitId, DiagnosisTypeId, DiagnosisTitle, Description, DiagnosisDate)
    VALUES (@V4, 81, 'Primary Osteoarthritis Right Knee (Grade II)', 'Weight-bearing X-ray shows joint space narrowing in medial compartment.', '2026-07-22');
    DECLARE @D4 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
    VALUES (@V4, @D4, 'Paracetamol 650mg twice daily after meals as needed. Quadriceps strengthening exercises. Glucosamine supplement 1500mg daily.', '/pdfs/prescription_devendra_oa.pdf', '2026-07-22');

    INSERT INTO dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId, Title, ReportType, FilePath, FileSize, ReportDate)
    VALUES (@V4, @D4, @Pat3, @Doc3, @DocUser3, 'Digital X-Ray Right Knee Joint', 'RadiologyReport', '/reports/xray_knee_devendra.pdf', 520000, '2026-07-22');


    -- Visit 5: Meera Solanki with Dr. Sunita Mehta (Dengue Fever)
    INSERT INTO dbo.Visits (PatientId, DoctorId, VisitDate, Notes)
    VALUES (@Pat4, @Doc4, '2026-07-25 09:45', 'High grade fever with body ache, retro-orbital headache, and joint pain for 3 days.');
    DECLARE @V5 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Diagnoses (VisitId, DiagnosisTypeId, DiagnosisTitle, Description, DiagnosisDate)
    VALUES (@V5, 6, 'Acute Dengue Fever (NS1 Positive)', 'Platelet count 110,000/mcL. Adequate oral hydration emphasized. No warning signs of severe dengue.', '2026-07-25');
    DECLARE @D5 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
    VALUES (@V5, @D5, 'Paracetamol 650mg every 6 hours for fever. ORS fluids 2.5 Liters daily. Strict avoidance of NSAIDs/Aspirin.', '/pdfs/prescription_meera_dengue.pdf', '2026-07-25');

    INSERT INTO dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId, Title, ReportType, FilePath, FileSize, ReportDate)
    VALUES (@V5, @D5, @Pat4, @Doc4, @DocUser4, 'Complete Blood Count (CBC) & Dengue NS1', 'LabReport', '/reports/cbc_dengue_meera.pdf', 195000, '2026-07-25');


    -- Visit 6: Vikram Desai with Dr. Hardik Joshi (Diabetes Type 2)
    INSERT INTO dbo.Visits (PatientId, DoctorId, VisitDate, Notes)
    VALUES (@Pat5, @Doc5, '2026-07-28 11:30', 'Routine executive health checkup. Complaints of fatigue and mild weight gain.');
    DECLARE @V6 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Diagnoses (VisitId, DiagnosisTypeId, DiagnosisTitle, Description, DiagnosisDate)
    VALUES (@V6, 46, 'Newly Diagnosed Type 2 Diabetes Mellitus', 'Fasting blood sugar 168 mg/dL, HbA1c 7.8%. Started on oral hypoglycemic therapy and lifestyle modifications.', '2026-07-28');
    DECLARE @D6 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
    VALUES (@V6, @D6, 'Metformin Hydrochloride 500mg twice daily with meals. 45-minute daily brisk walking. Re-check HbA1c in 90 days.', '/pdfs/prescription_vikram_diabetes.pdf', '2026-07-28');

    INSERT INTO dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId, Title, ReportType, FilePath, FileSize, ReportDate)
    VALUES (@V6, @D6, @Pat5, @Doc5, @DocUser5, 'HbA1c & Fasting Glucose Profile', 'LabReport', '/reports/hba1c_vikram.pdf', 210000, '2026-07-28');


    -- Visit 7: Aarav Sharma with Dr. Hardik Joshi (Viral Fever)
    INSERT INTO dbo.Visits (PatientId, DoctorId, VisitDate, Notes)
    VALUES (@Pat1, @Doc5, '2026-07-30 15:10', 'Patient presented with dry cough, throat pain, and mild fever for 2 days.');
    DECLARE @V7 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Diagnoses (VisitId, DiagnosisTypeId, DiagnosisTitle, Description, DiagnosisDate)
    VALUES (@V7, 2, 'Acute Viral Upper Respiratory Infection', 'Throat examination shows mild pharyngeal congestion. Lungs clear to auscultation.', '2026-07-30');
    DECLARE @D7 INT = SCOPE_IDENTITY();

    INSERT INTO dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
    VALUES (@V7, @D7, 'Paracetamol 500mg thrice daily after meals for 3 days. Levocetirizine 5mg at bedtime for 5 days. Warm saline gargles.', '/pdfs/prescription_aarav_viral.pdf', '2026-07-30');

    INSERT INTO dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId, Title, ReportType, FilePath, FileSize, ReportDate)
    VALUES (@V7, @D7, @Pat1, @Doc5, @DocUser5, 'Blood Routine & CRP Profile', 'LabReport', '/reports/blood_routine_aarav.pdf', 180000, '2026-07-30');


    -------------------------------------------------------------------
    -- 4. INSERT NOTIFICATIONS & AUDIT LOGS
    -------------------------------------------------------------------

    INSERT INTO dbo.Notifications (UserId, Title, Message, IsRead)
    VALUES
    (@PatUser1, 'New Prescription Issued', 'Dr. Rajesh Varma has issued a new prescription for Essential Stage-1 Hypertension.', 1),
    (@PatUser1, 'Medical Report Uploaded', 'ECG & Lipid Profile Panel has been added to your Aarogyam record.', 0),
    (@PatUser2, 'New Antenatal Prescription', 'Dr. Priyanjali Patel added antenatal supplements to your health record.', 0),
    (@PatUser3, 'New Prescription Issued', 'Dr. Aniket Shah added an orthopedic prescription for Right Knee Osteoarthritis.', 0),
    (@PatUser4, 'Lab Report Added', 'Complete Blood Count (CBC) & Dengue NS1 lab report is ready.', 0),
    (@PatUser5, 'New Prescription Issued', 'Dr. Hardik Joshi issued a prescription for Type 2 Diabetes Mellitus.', 0);

    INSERT INTO dbo.AuditLogs (UserId, Action, EntityName, EntityId)
    VALUES
    (@AdminUserId, 'APPROVE_DOCTOR', 'Doctors', @Doc1),
    (@AdminUserId, 'APPROVE_DOCTOR', 'Doctors', @Doc2),
    (@AdminUserId, 'APPROVE_DOCTOR', 'Doctors', @Doc3),
    (@AdminUserId, 'APPROVE_DOCTOR', 'Doctors', @Doc4),
    (@AdminUserId, 'APPROVE_DOCTOR', 'Doctors', @Doc5),
    (@DocUser1, 'CREATE_PRESCRIPTION', 'Prescriptions', @D1),
    (@DocUser2, 'CREATE_PRESCRIPTION', 'Prescriptions', @D3),
    (@DocUser3, 'CREATE_PRESCRIPTION', 'Prescriptions', @D4),
    (@DocUser4, 'CREATE_PRESCRIPTION', 'Prescriptions', @D5),
    (@DocUser5, 'CREATE_PRESCRIPTION', 'Prescriptions', @D6);

    COMMIT TRANSACTION;
    PRINT 'SUCCESS: 5 Active Doctors, 5 Active Patients, and 7 Clinical Visits with Diagnoses, Prescriptions, Reports, and Notifications created successfully.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(@ErrMsg, 16, 1);
END CATCH;
