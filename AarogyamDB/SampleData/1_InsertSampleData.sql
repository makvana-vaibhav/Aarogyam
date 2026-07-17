insert into dbo.HospitalMaster (HospitalName, Address, CityId, PhoneNumber, Email, IsActive)
values ('City Care Hospital', '12 Camp Street', 1, '02012345678', 'contact@citycare.example', 1);

insert into dbo.DegreeMaster (DegreeName, ShortName, Description)
values ('Bachelor of Medicine, Bachelor of Surgery', 'MBBS', 'Basic medical degree');

insert into dbo.SpecializationMaster (SpecializationName, Description)
values ('General Medicine', 'General adult medical care');

insert into dbo.DiagnosisTypeMaster (DiagnosisTypeName, Description, IsActive)
values ('Disease', 'A general illness or health condition', 1);

insert into dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
values (1, 'jane.mehta@example.com', '9820000001', 'PLACEHOLDER_HASH_1', 1, 1);

insert into dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
values (2, 'anil.rao@example.com', '9820000002', 'PLACEHOLDER_HASH_2', 1, 1);

insert into dbo.Users (RoleId, Email, PhoneNumber, PasswordHash, IsEmailVerified, IsActive)
values (3, 'admin@aarogyam.com', '9820000003', 'PLACEHOLDER_HASH_3', 1, 1);

insert into dbo.Patients (UserId, AarogyamId, FirstName, MiddleName, LastName, DateOfBirth, Gender,
    BloodGroup, Address, CountryId, StateId, CityId, EmergencyContact)
values (1, 'ARG-2025-000001', 'Jane', null, 'Mehta', '1991-04-12', 'Female',
    'O+', '221 MG Road', 1, 1, 1, '9820000009');

insert into dbo.Doctors (UserId, FirstName, MiddleName, LastName, LicenseNumber, HospitalId, DegreeId,
    SpecializationId, LicenseDocumentPath, DegreeDocumentPath, ApprovalStatus, ApprovedByUserId, ApprovedAt,
    Address, CountryId, StateId, CityId)
values (2, 'Anil', 'K', 'Rao', 'MCI-99213', 1, 1, 1,
    '/docs/license_anil.pdf', '/docs/degree_anil.pdf', 'Approved', 3, sysutcdatetime(),
    '45 Camp Street', 1, 1, 1);

insert into dbo.OTPMaster (UserId, OtpCode, ExpiresAt, IsUsed)
values (1, '123456', dateadd(minute, 10, sysutcdatetime()), 0);

insert into dbo.Visits (PatientId, DoctorId, VisitDate, Notes)
values (1, 1, '2026-06-14 10:30', 'Routine checkup, mild chest discomfort reported.');

insert into dbo.Diagnoses (VisitId, DiagnosisTypeId, DiagnosisTitle, Description, DiagnosisDate)
values (1, 1, 'Stage-1 Hypertension', 'Advised lifestyle changes and medication.', '2026-06-14');

insert into dbo.Prescriptions (VisitId, DiagnosisId, PrescriptionText, PdfPath, PrescriptionDate)
values (1, 1, 'Amlodipine 5mg once daily after breakfast for 30 days. Follow up after 30 days.',
    '/pdfs/prescription_1.pdf', '2026-06-14');

insert into dbo.MedicalReports (VisitId, DiagnosisId, PatientId, DoctorId, UploadedByUserId,
    Title, ReportType, FilePath, FileSize, ReportDate)
values (1, 1, 1, 1, 2, 'Lipid Panel', 'LabReport', '/reports/lipid_panel.pdf', 245000, '2026-06-14');

insert into dbo.Notifications (UserId, Title, Message, IsRead)
values (1, 'New Prescription', 'A new prescription has been added to your health record.', 0);

insert into dbo.AuditLogs (UserId, Action, EntityName, EntityId)
values (3, 'APPROVE_DOCTOR', 'Doctors', 1);
