-- Aarogyam SQL Server schema (db.sql)
-- Generated from the provided data dictionary (MVP)
SET NOCOUNT ON;

-- Drop tables if they exist (reverse dependency order)
IF OBJECT_ID('dbo.AuditLogs','U') IS NOT NULL DROP TABLE dbo.AuditLogs;
IF OBJECT_ID('dbo.Notifications','U') IS NOT NULL DROP TABLE dbo.Notifications;
IF OBJECT_ID('dbo.MedicalReports','U') IS NOT NULL DROP TABLE dbo.MedicalReports;
IF OBJECT_ID('dbo.PrescriptionItems','U') IS NOT NULL DROP TABLE dbo.PrescriptionItems;
IF OBJECT_ID('dbo.Prescriptions','U') IS NOT NULL DROP TABLE dbo.Prescriptions;
IF OBJECT_ID('dbo.Diagnoses','U') IS NOT NULL DROP TABLE dbo.Diagnoses;
IF OBJECT_ID('dbo.Visits','U') IS NOT NULL DROP TABLE dbo.Visits;
IF OBJECT_ID('dbo.Doctors','U') IS NOT NULL DROP TABLE dbo.Doctors;
IF OBJECT_ID('dbo.Patients','U') IS NOT NULL DROP TABLE dbo.Patients;
IF OBJECT_ID('dbo.Users','U') IS NOT NULL DROP TABLE dbo.Users;

-- 1. Users
CREATE TABLE dbo.Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(256) NOT NULL,
    PhoneNumber NVARCHAR(15) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) NOT NULL,
    IsEmailVerified BIT NOT NULL CONSTRAINT DF_Users_IsEmailVerified DEFAULT(0),
    IsPhoneVerified BIT NOT NULL CONSTRAINT DF_Users_IsPhoneVerified DEFAULT(0),
    OtpCode NVARCHAR(10) NULL,
    OtpExpiresAt DATETIME2(0) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT(1),
    LastLoginAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT UQ_Users_Email UNIQUE(Email),
    CONSTRAINT UQ_Users_Phone UNIQUE(PhoneNumber),
    CONSTRAINT CK_Users_Role CHECK (Role IN ('Patient','Doctor','Admin'))
);
CREATE INDEX IX_Users_Role ON dbo.Users(Role);

-- 2. Patients (1:1 -> Users)
CREATE TABLE dbo.Patients (
    PatientId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    AarogyamId NVARCHAR(20) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    DateOfBirth DATE NULL,
    Gender NVARCHAR(10) NULL,
    BloodGroup NVARCHAR(5) NULL,
    Address NVARCHAR(255) NULL,
    EmergencyContact NVARCHAR(15) NULL,
    QrCodePath NVARCHAR(255) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Patients_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT UQ_Patients_UserId UNIQUE(UserId),
    CONSTRAINT UQ_Patients_AarogyamId UNIQUE(AarogyamId),
    CONSTRAINT CK_Patients_Gender CHECK (Gender IN ('Male','Female','Other')),
    CONSTRAINT FK_Patients_UserId FOREIGN KEY(UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE
);
CREATE INDEX IX_Patients_FullName ON dbo.Patients(FullName);

-- 3. Doctors (1:1 -> Users)
CREATE TABLE dbo.Doctors (
    DoctorId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Specialization NVARCHAR(100) NULL,
    LicenseNumber NVARCHAR(50) NOT NULL,
    HospitalName NVARCHAR(150) NULL,
    ApprovalStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_Doctors_ApprovalStatus DEFAULT('Pending'),
    ApprovedByUserId INT NULL,
    ApprovedAt DATETIME2(0) NULL,
    RejectionReason NVARCHAR(255) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Doctors_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT UQ_Doctors_UserId UNIQUE(UserId),
    CONSTRAINT UQ_Doctors_License UNIQUE(LicenseNumber),
    CONSTRAINT CK_Doctors_ApprovalStatus CHECK (ApprovalStatus IN ('Pending','Approved','Rejected')),
    CONSTRAINT FK_Doctors_UserId FOREIGN KEY(UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
    CONSTRAINT FK_Doctors_ApprovedByUserId FOREIGN KEY(ApprovedByUserId) REFERENCES dbo.Users(UserId) ON DELETE NO ACTION
);
CREATE INDEX IX_Doctors_ApprovalStatus ON dbo.Doctors(ApprovalStatus);

-- 4. Visits
CREATE TABLE dbo.Visits (
    VisitId INT IDENTITY(1,1) PRIMARY KEY,
    PatientId INT NOT NULL,
    DoctorId INT NOT NULL,
    VisitDate DATE NOT NULL CONSTRAINT DF_Visits_VisitDate DEFAULT (CAST(SYSUTCDATETIME() AS DATE)),
    ChiefComplaint NVARCHAR(255) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Visits_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_Visits_PatientId FOREIGN KEY(PatientId) REFERENCES dbo.Patients(PatientId) ON DELETE CASCADE,
    CONSTRAINT FK_Visits_DoctorId FOREIGN KEY(DoctorId) REFERENCES dbo.Doctors(DoctorId) ON DELETE NO ACTION
);
CREATE INDEX IX_Visits_Patient_Date ON dbo.Visits(PatientId, VisitDate DESC);
CREATE INDEX IX_Visits_DoctorId ON dbo.Visits(DoctorId);

-- 5. Diagnoses
CREATE TABLE dbo.Diagnoses (
    DiagnosisId INT IDENTITY(1,1) PRIMARY KEY,
    VisitId INT NOT NULL,
    PatientId INT NOT NULL,
    DoctorId INT NOT NULL,
    DiagnosisType NVARCHAR(20) NOT NULL CONSTRAINT DF_Diagnoses_Type DEFAULT('Disease'),
    DiagnosisTitle NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    DiagnosisDate DATE NOT NULL CONSTRAINT DF_Diagnoses_Date DEFAULT (CAST(SYSUTCDATETIME() AS DATE)),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Diagnoses_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT CK_Diagnoses_Type CHECK (DiagnosisType IN ('Disease','Vaccination','Surgery','Allergy','Condition')),
    CONSTRAINT FK_Diagnoses_VisitId FOREIGN KEY(VisitId) REFERENCES dbo.Visits(VisitId) ON DELETE NO ACTION,
    CONSTRAINT FK_Diagnoses_PatientId FOREIGN KEY(PatientId) REFERENCES dbo.Patients(PatientId) ON DELETE CASCADE,
    CONSTRAINT FK_Diagnoses_DoctorId FOREIGN KEY(DoctorId) REFERENCES dbo.Doctors(DoctorId) ON DELETE NO ACTION
);
CREATE INDEX IX_Diagnoses_Patient_Date ON dbo.Diagnoses(PatientId, DiagnosisDate DESC);
CREATE INDEX IX_Diagnoses_VisitId ON dbo.Diagnoses(VisitId);
CREATE INDEX IX_Diagnoses_Patient_Type ON dbo.Diagnoses(PatientId, DiagnosisType);
CREATE INDEX IX_Diagnoses_DoctorId ON dbo.Diagnoses(DoctorId);

-- 6. Prescriptions
CREATE TABLE dbo.Prescriptions (
    PrescriptionId INT IDENTITY(1,1) PRIMARY KEY,
    VisitId INT NOT NULL,
    PatientId INT NOT NULL,
    DoctorId INT NOT NULL,
    DiagnosisId INT NULL,
    Notes NVARCHAR(MAX) NULL,
    PrescriptionDate DATE NOT NULL CONSTRAINT DF_Prescriptions_Date DEFAULT (CAST(SYSUTCDATETIME() AS DATE)),
    PdfPath NVARCHAR(255) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Prescriptions_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT FK_Prescriptions_VisitId FOREIGN KEY(VisitId) REFERENCES dbo.Visits(VisitId) ON DELETE NO ACTION,
    CONSTRAINT FK_Prescriptions_PatientId FOREIGN KEY(PatientId) REFERENCES dbo.Patients(PatientId) ON DELETE CASCADE,
    CONSTRAINT FK_Prescriptions_DoctorId FOREIGN KEY(DoctorId) REFERENCES dbo.Doctors(DoctorId) ON DELETE NO ACTION,
    CONSTRAINT FK_Prescriptions_DiagnosisId FOREIGN KEY(DiagnosisId) REFERENCES dbo.Diagnoses(DiagnosisId) ON DELETE SET NULL
);
CREATE INDEX IX_Prescriptions_Patient_Date ON dbo.Prescriptions(PatientId, PrescriptionDate DESC);
CREATE INDEX IX_Prescriptions_VisitId ON dbo.Prescriptions(VisitId);
CREATE INDEX IX_Prescriptions_DoctorId ON dbo.Prescriptions(DoctorId);

-- 7. PrescriptionItems
CREATE TABLE dbo.PrescriptionItems (
    PrescriptionItemId INT IDENTITY(1,1) PRIMARY KEY,
    PrescriptionId INT NOT NULL,
    MedicineName NVARCHAR(150) NOT NULL,
    Dosage NVARCHAR(50) NULL,
    Frequency NVARCHAR(50) NULL,
    Duration NVARCHAR(50) NULL,
    Instructions NVARCHAR(255) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_PrescriptionItems_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_PrescriptionItems_PrescriptionId FOREIGN KEY(PrescriptionId) REFERENCES dbo.Prescriptions(PrescriptionId) ON DELETE CASCADE
);
CREATE INDEX IX_PrescriptionItems_PrescriptionId ON dbo.PrescriptionItems(PrescriptionId);

-- 8. MedicalReports
CREATE TABLE dbo.MedicalReports (
    ReportId INT IDENTITY(1,1) PRIMARY KEY,
    PatientId INT NOT NULL,
    UploadedByUserId INT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    ReportType NVARCHAR(50) NULL,
    FilePath NVARCHAR(255) NOT NULL,
    FileSizeKB INT NULL,
    ContentType NVARCHAR(100) NULL,
    Source NVARCHAR(20) NOT NULL CONSTRAINT DF_MedicalReports_Source DEFAULT('Patient'),
    ReportDate DATE NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_MedicalReports_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2(0) NULL,
    CONSTRAINT CK_MedicalReports_Source CHECK (Source IN ('Patient','Doctor')),
    CONSTRAINT FK_MedicalReports_PatientId FOREIGN KEY(PatientId) REFERENCES dbo.Patients(PatientId) ON DELETE CASCADE,
    CONSTRAINT FK_MedicalReports_UploadedBy FOREIGN KEY(UploadedByUserId) REFERENCES dbo.Users(UserId) ON DELETE NO ACTION
);
CREATE INDEX IX_MedicalReports_PatientId ON dbo.MedicalReports(PatientId);
CREATE INDEX IX_MedicalReports_UploadedBy ON dbo.MedicalReports(UploadedByUserId);

-- 9. Notifications
CREATE TABLE dbo.Notifications (
    NotificationId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Title NVARCHAR(150) NOT NULL,
    Message NVARCHAR(500) NOT NULL,
    Type NVARCHAR(30) NULL,
    IsRead BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT(0),
    ReadAt DATETIME2(0) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_Notifications_UserId FOREIGN KEY(UserId) REFERENCES dbo.Users(UserId) ON DELETE CASCADE
);
CREATE INDEX IX_Notifications_User_Read ON dbo.Notifications(UserId, IsRead);

-- 10. AuditLogs (optional)
CREATE TABLE dbo.AuditLogs (
    AuditLogId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    Action NVARCHAR(100) NOT NULL,
    EntityType NVARCHAR(50) NULL,
    EntityId INT NULL,
    Details NVARCHAR(500) NULL,
    IpAddress NVARCHAR(45) NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_AuditLogs_UserId FOREIGN KEY(UserId) REFERENCES dbo.Users(UserId) ON DELETE SET NULL
);
CREATE INDEX IX_AuditLogs_User_Date ON dbo.AuditLogs(UserId, CreatedAt DESC);

-- End of schema
PRINT 'Aarogyam schema created.';
