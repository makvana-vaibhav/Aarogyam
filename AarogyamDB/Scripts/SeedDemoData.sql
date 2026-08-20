-- Seed 5 Patients and 5 Doctors through stored procedures
SET NOCOUNT ON;

DECLARE @PasswordHash NVARCHAR(200) = '$2a$11$iHVTMqvQVmFri3L7OZ0oKekm35Ct7sZqxKDFrq/gMDusgMx0/jxGO'; -- Password@123

-- ============================================================
-- 1. SEED 5 PATIENTS (via spRegisterPatient)
-- ============================================================

-- Patient 1: Vaibhav Makvana
EXEC dbo.spRegisterPatient
    @Email = 'patient.vaibhav@aarogyam.com',
    @PhoneNumber = '9825010001',
    @PasswordHash = @PasswordHash,
    @FirstName = 'Vaibhav',
    @MiddleName = 'R',
    @LastName = 'Makvana',
    @DateOfBirth = '1998-05-14',
    @Gender = 'Male',
    @BloodGroup = 'O+',
    @Address = '102, Shivalik Avenue, Kalawad Road',
    @CountryId = 1,
    @StateId = 7,
    @CityId = 33,
    @EmergencyContact = '9825010009';

-- Patient 2: Pooja Sharma
EXEC dbo.spRegisterPatient
    @Email = 'patient.pooja@aarogyam.com',
    @PhoneNumber = '9825010002',
    @PasswordHash = @PasswordHash,
    @FirstName = 'Pooja',
    @MiddleName = 'K',
    @LastName = 'Sharma',
    @DateOfBirth = '1995-08-22',
    @Gender = 'Female',
    @BloodGroup = 'B+',
    @Address = '45, Galaxy Apartments, Satellite',
    @CountryId = 1,
    @StateId = 7,
    @CityId = 1,
    @EmergencyContact = '9825010008';

-- Patient 3: Rahul Mehta
EXEC dbo.spRegisterPatient
    @Email = 'patient.rahul@aarogyam.com',
    @PhoneNumber = '9825010003',
    @PasswordHash = @PasswordHash,
    @FirstName = 'Rahul',
    @MiddleName = 'A',
    @LastName = 'Mehta',
    @DateOfBirth = '1989-12-03',
    @Gender = 'Male',
    @BloodGroup = 'A+',
    @Address = '12, Royal Residency, Ring Road',
    @CountryId = 1,
    @StateId = 7,
    @CityId = 39,
    @EmergencyContact = '9825010007';

-- Patient 4: Ananya Patel
EXEC dbo.spRegisterPatient
    @Email = 'patient.ananya@aarogyam.com',
    @PhoneNumber = '9825010004',
    @PasswordHash = @PasswordHash,
    @FirstName = 'Ananya',
    @MiddleName = 'S',
    @LastName = 'Patel',
    @DateOfBirth = '2001-03-18',
    @Gender = 'Female',
    @BloodGroup = 'AB+',
    @Address = '78, Lotus Park, Alkapuri',
    @CountryId = 1,
    @StateId = 7,
    @CityId = 43,
    @EmergencyContact = '9825010006';

-- Patient 5: Karan Joshi
EXEC dbo.spRegisterPatient
    @Email = 'patient.karan@aarogyam.com',
    @PhoneNumber = '9825010005',
    @PasswordHash = @PasswordHash,
    @FirstName = 'Karan',
    @MiddleName = 'M',
    @LastName = 'Joshi',
    @DateOfBirth = '1992-11-30',
    @Gender = 'Male',
    @BloodGroup = 'O-',
    @Address = '24, Green Meadows, Vidyanagar',
    @CountryId = 1,
    @StateId = 7,
    @CityId = 3,
    @EmergencyContact = '9825010005';


-- ============================================================
-- 2. SEED 5 DOCTORS (via spRegisterDoctor)
-- ============================================================

-- Doctor 1: Dr. Rajesh Varma (MBBS - General Physician)
EXEC dbo.spRegisterDoctor
    @Email = 'dr.rajesh@aarogyam.com',
    @PhoneNumber = '9825020001',
    @PasswordHash = @PasswordHash,
    @FirstName = 'Rajesh',
    @MiddleName = 'K',
    @LastName = 'Varma',
    @LicenseNumber = 'GMC-2015-88491',
    @HospitalId = 1,
    @DegreeId = 1,
    @SpecializationId = 1,
    @LicenseDocumentPath = 'uploads/licenses/demo_license_1.pdf',
    @DegreeDocumentPath = 'uploads/degrees/demo_degree_1.pdf',
    @Address = 'CIMS Hospital Campus, Science City Road, Sola',
    @CountryId = 1,
    @StateId = 7,
    @CityId = 1;

-- Doctor 2: Dr. Sunita Desai (MD - General Medicine)
EXEC dbo.spRegisterDoctor
    @Email = 'dr.sunita@aarogyam.com',
    @PhoneNumber = '9825020002',
    @PasswordHash = @PasswordHash,
    @FirstName = 'Sunita',
    @MiddleName = 'P',
    @LastName = 'Desai',
    @LicenseNumber = 'GMC-2018-77210',
    @HospitalId = 2,
    @DegreeId = 2,
    @SpecializationId = 5,
    @LicenseDocumentPath = 'uploads/licenses/demo_license_2.pdf',
    @DegreeDocumentPath = 'uploads/degrees/demo_degree_2.pdf',
    @Address = 'Zydus Hospital Road, Thaltej',
    @CountryId = 1,
    @StateId = 7,
    @CityId = 1;

-- Doctor 3: Dr. Hardik Shah (MD - Dermatology)
EXEC dbo.spRegisterDoctor
    @Email = 'dr.hardik@aarogyam.com',
    @PhoneNumber = '9825020003',
    @PasswordHash = @PasswordHash,
    @FirstName = 'Hardik',
    @MiddleName = 'V',
    @LastName = 'Shah',
    @LicenseNumber = 'GMC-2016-55104',
    @HospitalId = 3,
    @DegreeId = 2,
    @SpecializationId = 7,
    @LicenseDocumentPath = 'uploads/licenses/demo_license_3.pdf',
    @DegreeDocumentPath = 'uploads/degrees/demo_degree_3.pdf',
    @Address = 'Sterling Hospital, 150 Feet Ring Road',
    @CountryId = 1,
    @StateId = 7,
    @CityId = 33;

-- Doctor 4: Dr. Priyanjali Trivedi (MD - Pediatrics)
EXEC dbo.spRegisterDoctor
    @Email = 'dr.priyanjali@aarogyam.com',
    @PhoneNumber = '9825020004',
    @PasswordHash = @PasswordHash,
    @FirstName = 'Priyanjali',
    @MiddleName = 'N',
    @LastName = 'Trivedi',
    @LicenseNumber = 'GMC-2020-33921',
    @HospitalId = 4,
    @DegreeId = 2,
    @SpecializationId = 6,
    @LicenseDocumentPath = 'uploads/licenses/demo_license_4.pdf',
    @DegreeDocumentPath = 'uploads/degrees/demo_degree_4.pdf',
    @Address = 'Shalby Hospital, Surat-Dumas Road',
    @CountryId = 1,
    @StateId = 7,
    @CityId = 39;

-- Doctor 5: Dr. Aniket Parikh (MBBS - Family Medicine)
EXEC dbo.spRegisterDoctor
    @Email = 'dr.aniket@aarogyam.com',
    @PhoneNumber = '9825020005',
    @PasswordHash = @PasswordHash,
    @FirstName = 'Aniket',
    @MiddleName = 'D',
    @LastName = 'Parikh',
    @LicenseNumber = 'GMC-2019-91823',
    @HospitalId = 5,
    @DegreeId = 1,
    @SpecializationId = 2,
    @LicenseDocumentPath = 'uploads/licenses/demo_license_5.pdf',
    @DegreeDocumentPath = 'uploads/degrees/demo_degree_5.pdf',
    @Address = 'HCG Hospital, Sun Pharma Road, Atladra',
    @CountryId = 1,
    @StateId = 7,
    @CityId = 43;

-- ============================================================
-- 3. ACTIVATE AND APPROVE DEMO ACCOUNTS
-- ============================================================
UPDATE dbo.Users SET IsEmailVerified = 1, IsActive = 1;
UPDATE dbo.Doctors SET ApprovalStatus = 'Approved', ApprovedByUserId = 1, ApprovedAt = SYSUTCDATETIME();
