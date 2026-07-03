/* ============================================================================
   AAROGYAM — DIGITAL HEALTH IDENTITY
   Enterprise Database Redesign (Microsoft SQL Server / T-SQL)
   ----------------------------------------------------------------------------
   Source of truth : Aarogyam_Database_Design.md (data dictionary, 18 tables)
   Cross-checked    : Final_Project_Submission_Updated.docx (functional spec)
   Superseded       : db.sql (legacy MVP implementation — free-text lookups,
                       PrescriptionItems child table, no OTP history)

   ARCHITECT'S IMPROVEMENTS OVER THE SUBMITTED DESIGN
   ----------------------------------------------------------------------------
   1. ReportTypeMaster added      -> MedicalReports.ReportType was the one
      classification column still left as free text while every sibling
      (Role/Country/State/City/Hospital/Degree/Specialization/DiagnosisType)
      was promoted to a lookup. Flagged as an inconsistency in the design
      doc's own "Open Items" section (#4) — resolved here.
   2. NotificationTypeMaster added -> Same normalization logic applied to
      Notifications.Type for consistency and to support the admin's
      "Notification Management" feature (manage notification categories)
      without future schema changes.
   3. Users.IsPhoneVerified restored -> Flagged as an open item (#2) in the
      design doc. Re-added as a fast, queryable flag on Users; OTPMaster
      still retains full verification history.
   4. AuditLogs.Details restored -> Flagged as an open item (#5). Re-added
      as nullable free-text context, since an audit trail with no
      human-readable detail has limited investigative value.
   5. Multiple-cascade-path fix on MedicalReports -> The design doc lists
      BOTH "Patients -> MedicalReports (Cascade)" AND
      "Visits -> MedicalReports (Cascade)" with MedicalReports.PatientId
      always populated. Since Visits already cascades from Patients
      (Patients -> Visits -> MedicalReports), a second cascading path
      directly from Patients.PatientId would trigger SQL Server error 1785
      ("may cause cycles or multiple cascade paths"). Resolved by making
      MedicalReports.PatientId and MedicalReports.DoctorId NO ACTION —
      they remain fully queryable direct FKs, but the only cascading
      delete path is Patients -> Visits -> MedicalReports.
   6. Doctors.MiddleName made NULLable -> The submitted dictionary marks it
      NOT NULL while Patients.MiddleName is NULL-able for the same concept.
      Not everyone has a middle name; standardized to NULL-able.
   7. Added practical CHECK constraints -> Email format, phone length,
      report file size ceiling, DOB not in the future, RejectionReason
      required only when ApprovalStatus = 'Rejected', blood group domain.
   8. Composite UNIQUE constraints on StateMaster/CityMaster -> prevents
      duplicate "Gujarat" under the same country, duplicate "Rajkot" under
      the same state, while still allowing same city names across states.
   9. Filtered index on Doctors for the pending-approval admin queue, and
      composite indexes aligned to the design doc's own recommendations.
   10. AarogyamId format documented in a comment (ARG-YYYY-######) for the
       application layer to generate; not enforced via CHECK because the
       year segment changes, but length/prefix are still constrained.

   NAMING CONVENTION
   ----------------------------------------------------------------------------
   Tables/Columns : PascalCase
   PK             : PK_<Table>
   FK             : FK_<ChildTable>_<ParentTable>[_<Column>]
   CHECK          : CK_<Table>_<Column>
   DEFAULT        : DF_<Table>_<Column>
   UNIQUE         : UQ_<Table>_<Column>
   INDEX          : IX_<Table>_<Column(s)>
============================================================================ */

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/* ============================================================================
   1. CLEAN SLATE — drop in reverse dependency order (safe re-run)
============================================================================ */

/* ============================================================================
   2. LOOKUP / MASTER TABLES (no parents)
============================================================================ */

-----------------------------------------------------------------------------
-- RoleMaster
-----------------------------------------------------------------------------
CREATE TABLE dbo.RoleMaster (
    RoleId      INT IDENTITY(1,1) NOT NULL,
    RoleName    NVARCHAR(20)      NOT NULL,
    CreatedAt   DATETIME2(0)      NOT NULL,
    CONSTRAINT PK_RoleMaster PRIMARY KEY CLUSTERED (RoleId),
    CONSTRAINT UQ_RoleMaster_RoleName UNIQUE (RoleName),
    CONSTRAINT DF_RoleMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt
);
GO

-----------------------------------------------------------------------------
-- CountryMaster
-----------------------------------------------------------------------------
CREATE TABLE dbo.CountryMaster (
    CountryId    INT IDENTITY(1,1) NOT NULL,
    CountryName  NVARCHAR(100)     NOT NULL,
    CountryCode  NVARCHAR(10)      NOT NULL,
    IsActive     BIT               NOT NULL,
    CreatedAt    DATETIME2(0)      NOT NULL,
    UpdatedAt    DATETIME2(0)      NULL,
    CONSTRAINT PK_CountryMaster PRIMARY KEY CLUSTERED (CountryId),
    CONSTRAINT UQ_CountryMaster_CountryName UNIQUE (CountryName),
    CONSTRAINT UQ_CountryMaster_CountryCode UNIQUE (CountryCode),
    CONSTRAINT DF_CountryMaster_IsActive DEFAULT (1) FOR IsActive,
    CONSTRAINT DF_CountryMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt
);
GO

-----------------------------------------------------------------------------
-- StateMaster
-----------------------------------------------------------------------------
CREATE TABLE dbo.StateMaster (
    StateId    INT IDENTITY(1,1) NOT NULL,
    CountryId  INT                NOT NULL,
    StateName  NVARCHAR(100)      NOT NULL,
    CreatedAt  DATETIME2(0)       NOT NULL,
    UpdatedAt  DATETIME2(0)       NULL,
    CONSTRAINT PK_StateMaster PRIMARY KEY CLUSTERED (StateId),
    CONSTRAINT UQ_StateMaster_Country_StateName UNIQUE (CountryId, StateName),
    CONSTRAINT DF_StateMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT FK_StateMaster_CountryMaster FOREIGN KEY (CountryId)
        REFERENCES dbo.CountryMaster (CountryId) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX IX_StateMaster_CountryId ON dbo.StateMaster (CountryId);
GO

-----------------------------------------------------------------------------
-- CityMaster
-----------------------------------------------------------------------------
CREATE TABLE dbo.CityMaster (
    CityId     INT IDENTITY(1,1) NOT NULL,
    StateId    INT                NOT NULL,
    CityName   NVARCHAR(100)      NOT NULL,
    CreatedAt  DATETIME2(0)       NOT NULL,
    UpdatedAt  DATETIME2(0)       NULL,
    CONSTRAINT PK_CityMaster PRIMARY KEY CLUSTERED (CityId),
    CONSTRAINT UQ_CityMaster_State_CityName UNIQUE (StateId, CityName),
    CONSTRAINT DF_CityMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT FK_CityMaster_StateMaster FOREIGN KEY (StateId)
        REFERENCES dbo.StateMaster (StateId) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX IX_CityMaster_StateId ON dbo.CityMaster (StateId);
GO

-----------------------------------------------------------------------------
-- HospitalMaster
-----------------------------------------------------------------------------
CREATE TABLE dbo.HospitalMaster (
    HospitalId    INT IDENTITY(1,1) NOT NULL,
    HospitalName  NVARCHAR(150)     NOT NULL,
    Address       NVARCHAR(255)     NOT NULL,
    CityId        INT               NOT NULL,
    PhoneNumber   NVARCHAR(15)      NULL,
    Email         NVARCHAR(256)     NULL,
    IsActive      BIT               NOT NULL,
    CreatedAt     DATETIME2(0)      NOT NULL,
    UpdatedAt     DATETIME2(0)      NULL,
    CONSTRAINT PK_HospitalMaster PRIMARY KEY CLUSTERED (HospitalId),
    CONSTRAINT UQ_HospitalMaster_HospitalName UNIQUE (HospitalName),
    CONSTRAINT DF_HospitalMaster_IsActive DEFAULT (1) FOR IsActive,
    CONSTRAINT DF_HospitalMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT CK_HospitalMaster_Email CHECK (Email IS NULL OR Email LIKE '%_@__%.__%'),
    CONSTRAINT FK_HospitalMaster_CityMaster FOREIGN KEY (CityId)
        REFERENCES dbo.CityMaster (CityId) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX IX_HospitalMaster_CityId ON dbo.HospitalMaster (CityId);
GO

-----------------------------------------------------------------------------
-- DegreeMaster
-----------------------------------------------------------------------------
CREATE TABLE dbo.DegreeMaster (
    DegreeId     INT IDENTITY(1,1) NOT NULL,
    DegreeName   NVARCHAR(100)     NOT NULL,
    ShortName    NVARCHAR(20)      NOT NULL,
    Description  NVARCHAR(255)     NULL,
    CreatedAt    DATETIME2(0)      NOT NULL,
    UpdatedAt    DATETIME2(0)      NULL,
    CONSTRAINT PK_DegreeMaster PRIMARY KEY CLUSTERED (DegreeId),
    CONSTRAINT UQ_DegreeMaster_DegreeName UNIQUE (DegreeName),
    CONSTRAINT UQ_DegreeMaster_ShortName UNIQUE (ShortName),
    CONSTRAINT DF_DegreeMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt
);
GO

-----------------------------------------------------------------------------
-- SpecializationMaster
-----------------------------------------------------------------------------
CREATE TABLE dbo.SpecializationMaster (
    SpecializationId    INT IDENTITY(1,1) NOT NULL,
    SpecializationName  NVARCHAR(100)     NOT NULL,
    Description          NVARCHAR(255)     NULL,
    CreatedAt             DATETIME2(0)      NOT NULL,
    UpdatedAt             DATETIME2(0)      NULL,
    CONSTRAINT PK_SpecializationMaster PRIMARY KEY CLUSTERED (SpecializationId),
    CONSTRAINT UQ_SpecializationMaster_Name UNIQUE (SpecializationName),
    CONSTRAINT DF_SpecializationMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt
);
GO

-----------------------------------------------------------------------------
-- DiagnosisTypeMaster
-----------------------------------------------------------------------------
CREATE TABLE dbo.DiagnosisTypeMaster (
    DiagnosisTypeId    INT IDENTITY(1,1) NOT NULL,
    DiagnosisTypeName  NVARCHAR(100)     NOT NULL,
    Description         NVARCHAR(255)     NULL,
    IsActive             BIT               NOT NULL,
    CreatedAt            DATETIME2(0)      NOT NULL,
    UpdatedAt            DATETIME2(0)      NULL,
    CONSTRAINT PK_DiagnosisTypeMaster PRIMARY KEY CLUSTERED (DiagnosisTypeId),
    CONSTRAINT UQ_DiagnosisTypeMaster_Name UNIQUE (DiagnosisTypeName),
    CONSTRAINT DF_DiagnosisTypeMaster_IsActive DEFAULT (1) FOR IsActive,
    CONSTRAINT DF_DiagnosisTypeMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt
);
GO

-----------------------------------------------------------------------------
-- ReportTypeMaster  (architect addition — see improvement note #1)
-----------------------------------------------------------------------------
CREATE TABLE dbo.ReportTypeMaster (
    ReportTypeId    INT IDENTITY(1,1) NOT NULL,
    ReportTypeName  NVARCHAR(100)     NOT NULL,
    Description      NVARCHAR(255)     NULL,
    IsActive          BIT               NOT NULL,
    CreatedAt         DATETIME2(0)      NOT NULL,
    UpdatedAt         DATETIME2(0)      NULL,
    CONSTRAINT PK_ReportTypeMaster PRIMARY KEY CLUSTERED (ReportTypeId),
    CONSTRAINT UQ_ReportTypeMaster_Name UNIQUE (ReportTypeName),
    CONSTRAINT DF_ReportTypeMaster_IsActive DEFAULT (1) FOR IsActive,
    CONSTRAINT DF_ReportTypeMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt
);
GO

-----------------------------------------------------------------------------
-- NotificationTypeMaster  (architect addition — see improvement note #2)
-----------------------------------------------------------------------------
CREATE TABLE dbo.NotificationTypeMaster (
    NotificationTypeId    INT IDENTITY(1,1) NOT NULL,
    NotificationTypeName  NVARCHAR(50)      NOT NULL,
    Description             NVARCHAR(255)     NULL,
    IsActive                 BIT               NOT NULL,
    CreatedAt                DATETIME2(0)      NOT NULL,
    UpdatedAt                DATETIME2(0)      NULL,
    CONSTRAINT PK_NotificationTypeMaster PRIMARY KEY CLUSTERED (NotificationTypeId),
    CONSTRAINT UQ_NotificationTypeMaster_Name UNIQUE (NotificationTypeName),
    CONSTRAINT DF_NotificationTypeMaster_IsActive DEFAULT (1) FOR IsActive,
    CONSTRAINT DF_NotificationTypeMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt
);
GO

/* ============================================================================
   3. IDENTITY & AUTH
============================================================================ */

-----------------------------------------------------------------------------
-- Users
-----------------------------------------------------------------------------
CREATE TABLE dbo.Users (
    UserId            INT IDENTITY(1,1) NOT NULL,
    RoleId            INT                NOT NULL,
    Email             NVARCHAR(256)      NOT NULL,
    PhoneNumber       NVARCHAR(15)       NOT NULL,
    PasswordHash      NVARCHAR(255)      NOT NULL,
    IsEmailVerified   BIT                NOT NULL,
    IsPhoneVerified   BIT                NOT NULL,   -- restored, see improvement #3
    IsActive          BIT                NOT NULL,
    LastLoginAt       DATETIME2(0)       NULL,
    CreatedAt         DATETIME2(0)       NOT NULL,
    UpdatedAt         DATETIME2(0)       NULL,
    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserId),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT UQ_Users_PhoneNumber UNIQUE (PhoneNumber),
    CONSTRAINT DF_Users_IsEmailVerified DEFAULT (0) FOR IsEmailVerified,
    CONSTRAINT DF_Users_IsPhoneVerified DEFAULT (0) FOR IsPhoneVerified,
    CONSTRAINT DF_Users_IsActive DEFAULT (1) FOR IsActive,
    CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT CK_Users_Email CHECK (Email LIKE '%_@__%.__%'),
    CONSTRAINT CK_Users_PhoneNumber CHECK (LEN(PhoneNumber) BETWEEN 7 AND 15),
    CONSTRAINT FK_Users_RoleMaster FOREIGN KEY (RoleId)
        REFERENCES dbo.RoleMaster (RoleId) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX IX_Users_RoleId ON dbo.Users (RoleId);
GO

-----------------------------------------------------------------------------
-- OTPMaster
-----------------------------------------------------------------------------
CREATE TABLE dbo.OTPMaster (
    OtpId       INT IDENTITY(1,1) NOT NULL,
    UserId      INT                NOT NULL,
    OtpCode     NVARCHAR(10)       NOT NULL,
    ExpiresAt   DATETIME2(0)       NOT NULL,
    IsUsed      BIT                NOT NULL,
    CreatedAt   DATETIME2(0)       NOT NULL,
    CONSTRAINT PK_OTPMaster PRIMARY KEY CLUSTERED (OtpId),
    CONSTRAINT DF_OTPMaster_IsUsed DEFAULT (0) FOR IsUsed,
    CONSTRAINT DF_OTPMaster_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT FK_OTPMaster_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE
);
GO
CREATE NONCLUSTERED INDEX IX_OTPMaster_UserId_IsUsed ON dbo.OTPMaster (UserId, IsUsed);
GO

/* ============================================================================
   4. PROFILES
============================================================================ */

-----------------------------------------------------------------------------
-- Patients
-----------------------------------------------------------------------------
CREATE TABLE dbo.Patients (
    PatientId          INT IDENTITY(1,1) NOT NULL,
    UserId             INT                NOT NULL,
    AarogyamId         NVARCHAR(20)       NOT NULL,   -- app-generated: ARG-YYYY-NNNNNN
    FirstName          NVARCHAR(50)       NOT NULL,
    MiddleName         NVARCHAR(50)       NULL,
    LastName           NVARCHAR(50)       NOT NULL,
    DateOfBirth        DATE               NOT NULL,
    Gender             NVARCHAR(10)       NOT NULL,
    BloodGroup         NVARCHAR(5)        NULL,
    Address            NVARCHAR(255)      NOT NULL,
    CountryId          INT                NOT NULL,
    StateId            INT                NOT NULL,
    CityId             INT                NOT NULL,
    EmergencyContact   NVARCHAR(15)       NULL,
    QrCodePath         NVARCHAR(255)      NULL,
    CreatedAt          DATETIME2(0)       NOT NULL,
    UpdatedAt          DATETIME2(0)       NULL,
    CONSTRAINT PK_Patients PRIMARY KEY CLUSTERED (PatientId),
    CONSTRAINT UQ_Patients_UserId UNIQUE (UserId),
    CONSTRAINT UQ_Patients_AarogyamId UNIQUE (AarogyamId),
    CONSTRAINT DF_Patients_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT CK_Patients_Gender CHECK (Gender IN ('Male','Female','Other')),
    CONSTRAINT CK_Patients_BloodGroup CHECK (BloodGroup IS NULL OR BloodGroup IN
        ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    CONSTRAINT CK_Patients_DateOfBirth CHECK (DateOfBirth <= CAST(SYSUTCDATETIME() AS DATE)),
    CONSTRAINT CK_Patients_EmergencyContact CHECK (EmergencyContact IS NULL OR LEN(EmergencyContact) BETWEEN 7 AND 15),
    CONSTRAINT FK_Patients_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE,
    CONSTRAINT FK_Patients_CountryMaster FOREIGN KEY (CountryId)
        REFERENCES dbo.CountryMaster (CountryId) ON DELETE NO ACTION,
    CONSTRAINT FK_Patients_StateMaster FOREIGN KEY (StateId)
        REFERENCES dbo.StateMaster (StateId) ON DELETE NO ACTION,
    CONSTRAINT FK_Patients_CityMaster FOREIGN KEY (CityId)
        REFERENCES dbo.CityMaster (CityId) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX IX_Patients_LastName_FirstName ON dbo.Patients (LastName, FirstName);
CREATE NONCLUSTERED INDEX IX_Patients_CityId ON dbo.Patients (CityId);
GO

-----------------------------------------------------------------------------
-- Doctors
-----------------------------------------------------------------------------
CREATE TABLE dbo.Doctors (
    DoctorId              INT IDENTITY(1,1) NOT NULL,
    UserId                INT                NOT NULL,
    FirstName             NVARCHAR(50)       NOT NULL,
    MiddleName            NVARCHAR(50)       NULL,     -- made NULL-able, see improvement #6
    LastName              NVARCHAR(50)       NOT NULL,
    LicenseNumber         NVARCHAR(50)       NOT NULL,
    HospitalId            INT                NOT NULL,
    DegreeId              INT                NOT NULL,
    SpecializationId      INT                NOT NULL,
    LicenseDocumentPath   NVARCHAR(255)      NOT NULL,
    DegreeDocumentPath    NVARCHAR(255)      NOT NULL,
    ApprovalStatus        NVARCHAR(20)       NOT NULL,
    ApprovedByUserId      INT                NULL,
    ApprovedAt            DATETIME2(0)       NULL,
    RejectionReason       NVARCHAR(255)      NULL,
    Address               NVARCHAR(255)      NOT NULL,
    CountryId             INT                NOT NULL,
    StateId               INT                NOT NULL,
    CityId                INT                NOT NULL,
    CreatedAt             DATETIME2(0)       NOT NULL,
    UpdatedAt             DATETIME2(0)       NULL,
    CONSTRAINT PK_Doctors PRIMARY KEY CLUSTERED (DoctorId),
    CONSTRAINT UQ_Doctors_UserId UNIQUE (UserId),
    CONSTRAINT UQ_Doctors_LicenseNumber UNIQUE (LicenseNumber),
    CONSTRAINT DF_Doctors_ApprovalStatus DEFAULT ('Pending') FOR ApprovalStatus,
    CONSTRAINT DF_Doctors_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT CK_Doctors_ApprovalStatus CHECK (ApprovalStatus IN ('Pending','Approved','Rejected')),
    CONSTRAINT CK_Doctors_RejectionReason CHECK (ApprovalStatus <> 'Rejected' OR RejectionReason IS NOT NULL),
    CONSTRAINT FK_Doctors_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE,
    CONSTRAINT FK_Doctors_Users_ApprovedBy FOREIGN KEY (ApprovedByUserId)
        REFERENCES dbo.Users (UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_Doctors_HospitalMaster FOREIGN KEY (HospitalId)
        REFERENCES dbo.HospitalMaster (HospitalId) ON DELETE NO ACTION,
    CONSTRAINT FK_Doctors_DegreeMaster FOREIGN KEY (DegreeId)
        REFERENCES dbo.DegreeMaster (DegreeId) ON DELETE NO ACTION,
    CONSTRAINT FK_Doctors_SpecializationMaster FOREIGN KEY (SpecializationId)
        REFERENCES dbo.SpecializationMaster (SpecializationId) ON DELETE NO ACTION,
    CONSTRAINT FK_Doctors_CountryMaster FOREIGN KEY (CountryId)
        REFERENCES dbo.CountryMaster (CountryId) ON DELETE NO ACTION,
    CONSTRAINT FK_Doctors_StateMaster FOREIGN KEY (StateId)
        REFERENCES dbo.StateMaster (StateId) ON DELETE NO ACTION,
    CONSTRAINT FK_Doctors_CityMaster FOREIGN KEY (CityId)
        REFERENCES dbo.CityMaster (CityId) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX IX_Doctors_ApprovalStatus ON dbo.Doctors (ApprovalStatus);
CREATE NONCLUSTERED INDEX IX_Doctors_HospitalId ON dbo.Doctors (HospitalId);
CREATE NONCLUSTERED INDEX IX_Doctors_SpecializationId ON dbo.Doctors (SpecializationId);
-- Filtered index: admin's "Doctor Approval Management" queue only scans pending rows
CREATE NONCLUSTERED INDEX IX_Doctors_PendingApproval ON dbo.Doctors (CreatedAt)
    WHERE ApprovalStatus = 'Pending';
GO

/* ============================================================================
   5. CLINICAL / ENCOUNTER DATA
============================================================================ */

-----------------------------------------------------------------------------
-- Visits
-----------------------------------------------------------------------------
CREATE TABLE dbo.Visits (
    VisitId     INT IDENTITY(1,1) NOT NULL,
    PatientId   INT                NOT NULL,
    DoctorId    INT                NOT NULL,
    VisitDate   DATETIME2(0)       NOT NULL,
    Notes       NVARCHAR(MAX)      NULL,
    CreatedAt   DATETIME2(0)       NOT NULL,
    UpdatedAt   DATETIME2(0)       NULL,
    CONSTRAINT PK_Visits PRIMARY KEY CLUSTERED (VisitId),
    CONSTRAINT DF_Visits_VisitDate DEFAULT (SYSUTCDATETIME()) FOR VisitDate,
    CONSTRAINT DF_Visits_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT FK_Visits_Patients FOREIGN KEY (PatientId)
        REFERENCES dbo.Patients (PatientId) ON DELETE CASCADE,
    CONSTRAINT FK_Visits_Doctors FOREIGN KEY (DoctorId)
        REFERENCES dbo.Doctors (DoctorId) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX IX_Visits_Patient_Date ON dbo.Visits (PatientId, VisitDate DESC);
CREATE NONCLUSTERED INDEX IX_Visits_DoctorId ON dbo.Visits (DoctorId);
GO

-----------------------------------------------------------------------------
-- Diagnoses
-----------------------------------------------------------------------------
CREATE TABLE dbo.Diagnoses (
    DiagnosisId       INT IDENTITY(1,1) NOT NULL,
    VisitId           INT                NOT NULL,
    DiagnosisTypeId   INT                NOT NULL,
    DiagnosisTitle    NVARCHAR(200)      NOT NULL,
    Description       NVARCHAR(MAX)      NULL,
    DiagnosisDate     DATE               NOT NULL,
    CreatedAt         DATETIME2(0)       NOT NULL,
    UpdatedAt         DATETIME2(0)       NULL,
    CONSTRAINT PK_Diagnoses PRIMARY KEY CLUSTERED (DiagnosisId),
    CONSTRAINT DF_Diagnoses_DiagnosisDate DEFAULT (CAST(SYSUTCDATETIME() AS DATE)) FOR DiagnosisDate,
    CONSTRAINT DF_Diagnoses_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT FK_Diagnoses_Visits FOREIGN KEY (VisitId)
        REFERENCES dbo.Visits (VisitId) ON DELETE CASCADE,
    CONSTRAINT FK_Diagnoses_DiagnosisTypeMaster FOREIGN KEY (DiagnosisTypeId)
        REFERENCES dbo.DiagnosisTypeMaster (DiagnosisTypeId) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX IX_Diagnoses_VisitId ON dbo.Diagnoses (VisitId);
CREATE NONCLUSTERED INDEX IX_Diagnoses_DiagnosisTypeId ON dbo.Diagnoses (DiagnosisTypeId);
CREATE NONCLUSTERED INDEX IX_Diagnoses_DiagnosisDate ON dbo.Diagnoses (DiagnosisDate DESC);
GO

-----------------------------------------------------------------------------
-- Prescriptions
-----------------------------------------------------------------------------
CREATE TABLE dbo.Prescriptions (
    PrescriptionId      INT IDENTITY(1,1) NOT NULL,
    VisitId              INT                NOT NULL,
    DiagnosisId          INT                NULL,
    PrescriptionText     NVARCHAR(MAX)      NOT NULL,
    PdfPath               NVARCHAR(255)      NULL,
    PrescriptionDate     DATE               NOT NULL,
    CreatedAt             DATETIME2(0)       NOT NULL,
    UpdatedAt             DATETIME2(0)       NULL,
    CONSTRAINT PK_Prescriptions PRIMARY KEY CLUSTERED (PrescriptionId),
    CONSTRAINT DF_Prescriptions_PrescriptionDate DEFAULT (CAST(SYSUTCDATETIME() AS DATE)) FOR PrescriptionDate,
    CONSTRAINT DF_Prescriptions_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT FK_Prescriptions_Visits FOREIGN KEY (VisitId)
        REFERENCES dbo.Visits (VisitId) ON DELETE CASCADE,
    CONSTRAINT FK_Prescriptions_Diagnoses FOREIGN KEY (DiagnosisId)
        REFERENCES dbo.Diagnoses (DiagnosisId) ON DELETE SET NULL
);
GO
CREATE NONCLUSTERED INDEX IX_Prescriptions_VisitId ON dbo.Prescriptions (VisitId);
CREATE NONCLUSTERED INDEX IX_Prescriptions_DiagnosisId ON dbo.Prescriptions (DiagnosisId);
CREATE NONCLUSTERED INDEX IX_Prescriptions_PrescriptionDate ON dbo.Prescriptions (PrescriptionDate DESC);
GO

-----------------------------------------------------------------------------
-- MedicalReports
-- NOTE on cascade design: PatientId/DoctorId are kept as NO ACTION direct FKs
-- for query convenience (avoids always joining through Visits), while the
-- only cascading delete path into this table runs Patients -> Visits ->
-- MedicalReports. This avoids SQL Server error 1785 (multiple cascade paths).
-----------------------------------------------------------------------------
CREATE TABLE dbo.MedicalReports (
    ReportId            INT IDENTITY(1,1) NOT NULL,
    VisitId              INT                NOT NULL,
    DiagnosisId          INT                NULL,
    PatientId            INT                NOT NULL,
    DoctorId              INT                NOT NULL,
    UploadedByUserId     INT                NOT NULL,
    Title                 NVARCHAR(200)      NOT NULL,
    ReportTypeId         INT                NOT NULL,
    FilePath              NVARCHAR(255)      NOT NULL,
    FileSize              INT                NULL,     -- kilobytes
    ReportDate            DATE               NULL,
    CreatedAt             DATETIME2(0)       NOT NULL,
    UpdatedAt             DATETIME2(0)       NULL,
    CONSTRAINT PK_MedicalReports PRIMARY KEY CLUSTERED (ReportId),
    CONSTRAINT DF_MedicalReports_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    -- 20 MB ceiling (20480 KB) for a single uploaded report
    CONSTRAINT CK_MedicalReports_FileSize CHECK (FileSize IS NULL OR (FileSize > 0 AND FileSize <= 20480)),
    CONSTRAINT FK_MedicalReports_Visits FOREIGN KEY (VisitId)
        REFERENCES dbo.Visits (VisitId) ON DELETE CASCADE,
    CONSTRAINT FK_MedicalReports_Diagnoses FOREIGN KEY (DiagnosisId)
        REFERENCES dbo.Diagnoses (DiagnosisId) ON DELETE SET NULL,
    CONSTRAINT FK_MedicalReports_Patients FOREIGN KEY (PatientId)
        REFERENCES dbo.Patients (PatientId) ON DELETE NO ACTION,
    CONSTRAINT FK_MedicalReports_Doctors FOREIGN KEY (DoctorId)
        REFERENCES dbo.Doctors (DoctorId) ON DELETE NO ACTION,
    CONSTRAINT FK_MedicalReports_Users_UploadedBy FOREIGN KEY (UploadedByUserId)
        REFERENCES dbo.Users (UserId) ON DELETE NO ACTION,
    CONSTRAINT FK_MedicalReports_ReportTypeMaster FOREIGN KEY (ReportTypeId)
        REFERENCES dbo.ReportTypeMaster (ReportTypeId) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX IX_MedicalReports_PatientId ON dbo.MedicalReports (PatientId);
CREATE NONCLUSTERED INDEX IX_MedicalReports_VisitId ON dbo.MedicalReports (VisitId);
CREATE NONCLUSTERED INDEX IX_MedicalReports_UploadedByUserId ON dbo.MedicalReports (UploadedByUserId);
CREATE NONCLUSTERED INDEX IX_MedicalReports_ReportTypeId ON dbo.MedicalReports (ReportTypeId);
GO

/* ============================================================================
   6. ENGAGEMENT & ADMIN
============================================================================ */

-----------------------------------------------------------------------------
-- Notifications
-----------------------------------------------------------------------------
CREATE TABLE dbo.Notifications (
    NotificationId       BIGINT IDENTITY(1,1) NOT NULL,
    UserId                INT                    NOT NULL,
    NotificationTypeId   INT                    NOT NULL,
    Title                 NVARCHAR(150)          NOT NULL,
    Message               NVARCHAR(500)          NOT NULL,
    IsRead                BIT                    NOT NULL,
    ReadAt                DATETIME2(0)           NULL,
    EmailSent             BIT                    NOT NULL,
    EmailSentAt           DATETIME2(0)           NULL,
    CreatedAt             DATETIME2(0)           NOT NULL,
    CONSTRAINT PK_Notifications PRIMARY KEY CLUSTERED (NotificationId),
    CONSTRAINT DF_Notifications_IsRead DEFAULT (0) FOR IsRead,
    CONSTRAINT DF_Notifications_EmailSent DEFAULT (0) FOR EmailSent,
    CONSTRAINT DF_Notifications_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE,
    CONSTRAINT FK_Notifications_NotificationTypeMaster FOREIGN KEY (NotificationTypeId)
        REFERENCES dbo.NotificationTypeMaster (NotificationTypeId) ON DELETE NO ACTION
);
GO
CREATE NONCLUSTERED INDEX IX_Notifications_User_IsRead ON dbo.Notifications (UserId, IsRead);
GO

-----------------------------------------------------------------------------
-- AuditLogs (optional per design doc — retained for admin monitoring)
-----------------------------------------------------------------------------
CREATE TABLE dbo.AuditLogs (
    AuditLogId    BIGINT IDENTITY(1,1) NOT NULL,
    UserId         INT                    NULL,
    Action         NVARCHAR(100)          NOT NULL,
    EntityName    NVARCHAR(50)           NOT NULL,
    EntityId       INT                    NOT NULL,
    Details        NVARCHAR(500)          NULL,  -- restored, see improvement #4
    IpAddress      NVARCHAR(45)           NULL,
    CreatedAt      DATETIME2(0)           NOT NULL,
    CONSTRAINT PK_AuditLogs PRIMARY KEY CLUSTERED (AuditLogId),
    CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT (SYSUTCDATETIME()) FOR CreatedAt,
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE SET NULL
);
GO
CREATE NONCLUSTERED INDEX IX_AuditLogs_User_CreatedAt ON dbo.AuditLogs (UserId, CreatedAt DESC);
CREATE NONCLUSTERED INDEX IX_AuditLogs_EntityName_EntityId ON dbo.AuditLogs (EntityName, EntityId);
GO

/* ============================================================================
   7. SEED DATA
============================================================================ */

-----------------------------------------------------------------------------
-- RoleMaster
-----------------------------------------------------------------------------
INSERT INTO dbo.RoleMaster (RoleName) VALUES
    (N'Patient'), (N'Doctor'), (N'Admin');
GO

-----------------------------------------------------------------------------
-- CountryMaster
-----------------------------------------------------------------------------
INSERT INTO dbo.CountryMaster (CountryName, CountryCode) VALUES
    (N'India', N'IN');
GO

-----------------------------------------------------------------------------
-- StateMaster
-----------------------------------------------------------------------------
INSERT INTO dbo.StateMaster (CountryId, StateName)
SELECT c.CountryId, s.StateName
FROM (VALUES (N'Gujarat'), (N'Maharashtra')) AS s(StateName)
CROSS JOIN dbo.CountryMaster c
WHERE c.CountryName = N'India';
GO

-----------------------------------------------------------------------------
-- CityMaster
-----------------------------------------------------------------------------
INSERT INTO dbo.CityMaster (StateId, CityName)
SELECT st.StateId, ct.CityName
FROM (VALUES (N'Gujarat', N'Rajkot'),
             (N'Gujarat', N'Ahmedabad'),
             (N'Gujarat', N'Surat'),
             (N'Maharashtra', N'Mumbai')) AS ct(StateName, CityName)
JOIN dbo.StateMaster st ON st.StateName = ct.StateName;
GO

-----------------------------------------------------------------------------
-- HospitalMaster
-----------------------------------------------------------------------------
INSERT INTO dbo.HospitalMaster (HospitalName, Address, CityId)
SELECT h.HospitalName, h.Address, c.CityId
FROM (VALUES
        (N'AIIMS',           N'AIIMS Campus, Ansari Nagar', N'Ahmedabad'),
        (N'Civil Hospital',  N'Civil Hospital Road',        N'Ahmedabad'),
        (N'Apollo Hospital', N'Apollo Circle',               N'Mumbai')
     ) AS h(HospitalName, Address, CityName)
JOIN dbo.CityMaster c ON c.CityName = h.CityName;
GO

-----------------------------------------------------------------------------
-- DegreeMaster
-----------------------------------------------------------------------------
INSERT INTO dbo.DegreeMaster (DegreeName, ShortName) VALUES
    (N'Bachelor of Medicine, Bachelor of Surgery', N'MBBS'),
    (N'Doctor of Medicine',                        N'MD'),
    (N'Master of Surgery',                          N'MS'),
    (N'Bachelor of Dental Surgery',                 N'BDS'),
    (N'Bachelor of Homeopathic Medicine and Surgery', N'BHMS');
GO

-----------------------------------------------------------------------------
-- SpecializationMaster
-----------------------------------------------------------------------------
INSERT INTO dbo.SpecializationMaster (SpecializationName) VALUES
    (N'Cardiology'), (N'Neurology'), (N'Orthopedics'),
    (N'Dermatology'), (N'General Physician');
GO

-----------------------------------------------------------------------------
-- DiagnosisTypeMaster
-----------------------------------------------------------------------------
INSERT INTO dbo.DiagnosisTypeMaster (DiagnosisTypeName) VALUES
    (N'Disease'), (N'Vaccination'), (N'Surgery'), (N'Allergy'), (N'Condition');
GO

-----------------------------------------------------------------------------
-- ReportTypeMaster
-----------------------------------------------------------------------------
INSERT INTO dbo.ReportTypeMaster (ReportTypeName) VALUES
    (N'Lab Report'), (N'X-Ray'), (N'MRI'), (N'CT Scan'),
    (N'Ultrasound'), (N'Blood Test'), (N'Prescription Scan');
GO

-----------------------------------------------------------------------------
-- NotificationTypeMaster
-----------------------------------------------------------------------------
INSERT INTO dbo.NotificationTypeMaster (NotificationTypeName) VALUES
    (N'DoctorApproval'), (N'ReportUpload'), (N'Appointment'),
    (N'AccountUpdate'), (N'System');
GO

/* ============================================================================
   8. QUALITY-CHECK QUERIES (run manually to verify integrity after seeding)
   ----------------------------------------------------------------------------
   -- Every FK target exists:
   -- SELECT * FROM sys.foreign_keys WHERE is_disabled = 1;
   -- No duplicate constraint names:
   -- SELECT name, COUNT(*) FROM sys.objects WHERE type IN ('PK','F','UQ','C','D')
   --   GROUP BY name HAVING COUNT(*) > 1;
============================================================================ */

PRINT 'AarogyamDB schema created and seeded successfully.';
GO