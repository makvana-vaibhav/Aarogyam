/* =====================================================================
   AAROGYAM - DIGITAL HEALTH IDENTITY
   SQL Server Database Creation Script
   Generated strictly from: Aarogyam_Database_Design.md (Data Dictionary)
   =====================================================================

   ENGINEERING NOTE - CASCADE PATH ADJUSTMENTS (required for this script
   to actually execute on SQL Server; SQL Server rejects a table having
   more than one cascading (CASCADE / SET NULL / SET DEFAULT) referential
   path back to the same ancestor table):

   The data dictionary specifies THREE cascading paths that all converge
   on MedicalReports/Prescriptions from Patients:
     1) Patients -> Visits (CASCADE) -> MedicalReports/Prescriptions (CASCADE) [via VisitId]
     2) Patients -> Visits (CASCADE) -> Diagnoses (CASCADE) -> MedicalReports/Prescriptions (SET NULL) [via DiagnosisId]
     3) Patients -> MedicalReports (CASCADE) [direct PatientId FK, MedicalReports only]

   SQL Server will refuse to create these tables as-is. To keep the
   primary clinical cascade intact (Visits -> Diagnoses -> Prescriptions/
   MedicalReports), the following three FKs were changed from the
   dictionary's stated action to NO ACTION:
     - Prescriptions.DiagnosisId   -> Diagnoses.DiagnosisId   (spec: SET NULL, here: NO ACTION)
     - MedicalReports.DiagnosisId  -> Diagnoses.DiagnosisId   (spec: SET NULL, here: NO ACTION)
     - MedicalReports.PatientId    -> Patients.PatientId      (spec: CASCADE,  here: NO ACTION)

   Referential integrity is fully enforced in all cases; only the
   automatic cascade/set-null behavior on these three specific paths is
   disabled. This is flagged again as an inline comment at each affected
   constraint below.
   ===================================================================== */

SET NOCOUNT ON;
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =====================================================================
   SECTION 0: LOOKUP / MASTER TABLES
   ===================================================================== */

-- ---------------------------------------------------------------------
-- Table: RoleMaster
-- Lookup for user roles (Patient, Doctor, Admin). FK target of Users.RoleId.
-- ---------------------------------------------------------------------
CREATE TABLE dbo.RoleMaster
(
    RoleId      INT IDENTITY(1,1)  NOT NULL,
    RoleName    NVARCHAR(20)       NOT NULL,
    CreatedAt   DATETIME2          NOT NULL CONSTRAINT DF_RoleMaster_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_RoleMaster PRIMARY KEY CLUSTERED (RoleId),
    CONSTRAINT UQ_RoleMaster_RoleName UNIQUE (RoleName)
);
GO

-- ---------------------------------------------------------------------
-- Table: CountryMaster
-- ---------------------------------------------------------------------
CREATE TABLE dbo.CountryMaster
(
    CountryId    INT IDENTITY(1,1) NOT NULL,
    CountryName  NVARCHAR(100)     NOT NULL,
    CountryCode  NVARCHAR(10)      NOT NULL,
    IsActive     BIT               NOT NULL CONSTRAINT DF_CountryMaster_IsActive DEFAULT (1),
    CreatedAt    DATETIME2         NOT NULL CONSTRAINT DF_CountryMaster_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt    DATETIME2         NULL,
    CONSTRAINT PK_CountryMaster PRIMARY KEY CLUSTERED (CountryId),
    CONSTRAINT UQ_CountryMaster_CountryName UNIQUE (CountryName),
    CONSTRAINT UQ_CountryMaster_CountryCode UNIQUE (CountryCode)
);
GO

-- ---------------------------------------------------------------------
-- Table: StateMaster
-- ---------------------------------------------------------------------
CREATE TABLE dbo.StateMaster
(
    StateId     INT IDENTITY(1,1) NOT NULL,
    CountryId   INT               NOT NULL,
    StateName   NVARCHAR(100)     NOT NULL,
    CreatedAt   DATETIME2         NOT NULL CONSTRAINT DF_StateMaster_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt   DATETIME2         NULL,
    CONSTRAINT PK_StateMaster PRIMARY KEY CLUSTERED (StateId),
    CONSTRAINT FK_StateMaster_CountryMaster FOREIGN KEY (CountryId)
        REFERENCES dbo.CountryMaster (CountryId) ON DELETE NO ACTION
);
GO

-- ---------------------------------------------------------------------
-- Table: CityMaster
-- ---------------------------------------------------------------------
CREATE TABLE dbo.CityMaster
(
    CityId      INT IDENTITY(1,1) NOT NULL,
    StateId     INT               NOT NULL,
    CityName    NVARCHAR(100)     NOT NULL,
    CreatedAt   DATETIME2         NOT NULL CONSTRAINT DF_CityMaster_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt   DATETIME2         NULL,
    CONSTRAINT PK_CityMaster PRIMARY KEY CLUSTERED (CityId),
    CONSTRAINT FK_CityMaster_StateMaster FOREIGN KEY (StateId)
        REFERENCES dbo.StateMaster (StateId) ON DELETE NO ACTION
);
GO

-- ---------------------------------------------------------------------
-- Table: HospitalMaster
-- ---------------------------------------------------------------------
CREATE TABLE dbo.HospitalMaster
(
    HospitalId    INT IDENTITY(1,1) NOT NULL,
    HospitalName  NVARCHAR(150)     NOT NULL,
    Address       NVARCHAR(255)     NOT NULL,
    CityId        INT               NOT NULL,
    PhoneNumber   NVARCHAR(15)      NULL,
    Email         NVARCHAR(256)     NULL,
    IsActive      BIT               NOT NULL CONSTRAINT DF_HospitalMaster_IsActive DEFAULT (1),
    CreatedAt     DATETIME2         NOT NULL CONSTRAINT DF_HospitalMaster_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt     DATETIME2         NULL,
    CONSTRAINT PK_HospitalMaster PRIMARY KEY CLUSTERED (HospitalId),
    CONSTRAINT UQ_HospitalMaster_HospitalName UNIQUE (HospitalName),
    CONSTRAINT FK_HospitalMaster_CityMaster FOREIGN KEY (CityId)
        REFERENCES dbo.CityMaster (CityId) ON DELETE NO ACTION
);
GO

-- ---------------------------------------------------------------------
-- Table: DegreeMaster
-- ---------------------------------------------------------------------
CREATE TABLE dbo.DegreeMaster
(
    DegreeId     INT IDENTITY(1,1) NOT NULL,
    DegreeName   NVARCHAR(100)     NOT NULL,
    ShortName    NVARCHAR(20)      NOT NULL,
    Description  NVARCHAR(255)     NULL,
    CreatedAt    DATETIME2         NOT NULL CONSTRAINT DF_DegreeMaster_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt    DATETIME2         NULL,
    CONSTRAINT PK_DegreeMaster PRIMARY KEY CLUSTERED (DegreeId),
    CONSTRAINT UQ_DegreeMaster_DegreeName UNIQUE (DegreeName),
    CONSTRAINT UQ_DegreeMaster_ShortName UNIQUE (ShortName)
);
GO

-- ---------------------------------------------------------------------
-- Table: SpecializationMaster
-- ---------------------------------------------------------------------
CREATE TABLE dbo.SpecializationMaster
(
    SpecializationId    INT IDENTITY(1,1) NOT NULL,
    SpecializationName  NVARCHAR(100)     NOT NULL,
    Description         NVARCHAR(255)     NULL,
    CreatedAt            DATETIME2        NOT NULL CONSTRAINT DF_SpecializationMaster_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt            DATETIME2        NULL,
    CONSTRAINT PK_SpecializationMaster PRIMARY KEY CLUSTERED (SpecializationId),
    CONSTRAINT UQ_SpecializationMaster_SpecializationName UNIQUE (SpecializationName)
);
GO

-- ---------------------------------------------------------------------
-- Table: DiagnosisTypeMaster
-- ---------------------------------------------------------------------
CREATE TABLE dbo.DiagnosisTypeMaster
(
    DiagnosisTypeId    INT IDENTITY(1,1) NOT NULL,
    DiagnosisTypeName  NVARCHAR(100)     NOT NULL,
    Description        NVARCHAR(255)     NULL,
    IsActive           BIT               NOT NULL CONSTRAINT DF_DiagnosisTypeMaster_IsActive DEFAULT (1),
    CreatedAt          DATETIME2         NOT NULL CONSTRAINT DF_DiagnosisTypeMaster_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt          DATETIME2         NULL,
    CONSTRAINT PK_DiagnosisTypeMaster PRIMARY KEY CLUSTERED (DiagnosisTypeId),
    CONSTRAINT UQ_DiagnosisTypeMaster_DiagnosisTypeName UNIQUE (DiagnosisTypeName)
);
GO

/* =====================================================================
   SECTION 1: IDENTITY & AUTH
   ===================================================================== */

-- ---------------------------------------------------------------------
-- Table: Users
-- ---------------------------------------------------------------------
CREATE TABLE dbo.Users
(
    UserId            INT IDENTITY(1,1) NOT NULL,
    RoleId            INT               NOT NULL,
    Email             NVARCHAR(256)     NOT NULL,
    PhoneNumber       NVARCHAR(15)      NOT NULL,
    PasswordHash      NVARCHAR(255)     NOT NULL,
    IsEmailVerified   BIT               NOT NULL CONSTRAINT DF_Users_IsEmailVerified DEFAULT (0),
    IsActive          BIT               NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT (1),
    LastLoginAt       DATETIME2         NULL,
    CreatedAt         DATETIME2         NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt         DATETIME2         NULL,
    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (UserId),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT UQ_Users_Phone UNIQUE (PhoneNumber),
    CONSTRAINT FK_Users_RoleMaster FOREIGN KEY (RoleId)
        REFERENCES dbo.RoleMaster (RoleId) ON DELETE NO ACTION
);
GO

-- ---------------------------------------------------------------------
-- Table: OTPMaster
-- ---------------------------------------------------------------------
CREATE TABLE dbo.OTPMaster
(
    OtpId        INT IDENTITY(1,1) NOT NULL,
    UserId       INT               NOT NULL,
    OtpCode      NVARCHAR(10)      NOT NULL,
    ExpiresAt    DATETIME2         NOT NULL,
    IsUsed       BIT               NOT NULL CONSTRAINT DF_OTPMaster_IsUsed DEFAULT (0),
    CreatedAt    DATETIME2         NOT NULL CONSTRAINT DF_OTPMaster_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_OTPMaster PRIMARY KEY CLUSTERED (OtpId),
    CONSTRAINT FK_OTPMaster_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE
);
GO

/* =====================================================================
   SECTION 2: PROFILE TABLES
   ===================================================================== */

-- ---------------------------------------------------------------------
-- Table: Patients
-- ---------------------------------------------------------------------
CREATE TABLE dbo.Patients
(
    PatientId          INT IDENTITY(1,1) NOT NULL,
    UserId             INT               NOT NULL,
    AarogyamId         NVARCHAR(20)      NOT NULL,
    FirstName          NVARCHAR(50)      NOT NULL,
    MiddleName         NVARCHAR(50)      NULL,
    LastName           NVARCHAR(50)      NOT NULL,
    DateOfBirth        DATE              NOT NULL,
    Gender             NVARCHAR(10)      NOT NULL,
    BloodGroup         NVARCHAR(5)       NULL,
    Address            NVARCHAR(255)     NOT NULL,
    CountryId          INT               NOT NULL,
    StateId            INT               NOT NULL,
    CityId             INT               NOT NULL,
    EmergencyContact   NVARCHAR(15)      NULL,
    QrCodePath         NVARCHAR(255)     NULL,
    CreatedAt          DATETIME2         NOT NULL CONSTRAINT DF_Patients_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt          DATETIME2         NULL,
    CONSTRAINT PK_Patients PRIMARY KEY CLUSTERED (PatientId),
    CONSTRAINT UQ_Patients_UserId UNIQUE (UserId),
    CONSTRAINT UQ_Patients_AarogyamId UNIQUE (AarogyamId),
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

-- ---------------------------------------------------------------------
-- Table: Doctors
-- ---------------------------------------------------------------------
CREATE TABLE dbo.Doctors
(
    DoctorId              INT IDENTITY(1,1) NOT NULL,
    UserId                INT               NOT NULL,
    FirstName             NVARCHAR(50)      NOT NULL,
    MiddleName            NVARCHAR(50)      NOT NULL,
    LastName              NVARCHAR(50)      NOT NULL,
    LicenseNumber         NVARCHAR(50)      NOT NULL,
    HospitalId            INT               NOT NULL,
    DegreeId              INT               NOT NULL,
    SpecializationId      INT               NOT NULL,
    LicenseDocumentPath   NVARCHAR(255)     NOT NULL,
    DegreeDocumentPath    NVARCHAR(255)     NOT NULL,
    ApprovalStatus        NVARCHAR(20)      NOT NULL,
    ApprovedByUserId      INT               NULL,
    ApprovedAt            DATETIME2         NULL,
    RejectionReason       NVARCHAR(255)     NULL,
    Address               NVARCHAR(255)     NOT NULL,
    CountryId             INT               NOT NULL,
    StateId               INT               NOT NULL,
    CityId                INT               NOT NULL,
    CreatedAt             DATETIME2         NOT NULL CONSTRAINT DF_Doctors_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt             DATETIME2         NULL,
    CONSTRAINT PK_Doctors PRIMARY KEY CLUSTERED (DoctorId),
    CONSTRAINT UQ_Doctors_UserId UNIQUE (UserId),
    CONSTRAINT UQ_Doctors_LicenseNumber UNIQUE (LicenseNumber),
    CONSTRAINT CK_Doctors_ApprovalStatus CHECK (ApprovalStatus IN ('Pending','Approved','Rejected')),
    CONSTRAINT FK_Doctors_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE,
    CONSTRAINT FK_Doctors_ApprovedByUser FOREIGN KEY (ApprovedByUserId)
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

/* =====================================================================
   SECTION 3: ENCOUNTER & CLINICAL RECORDS
   ===================================================================== */

-- ---------------------------------------------------------------------
-- Table: Visits
-- ---------------------------------------------------------------------
CREATE TABLE dbo.Visits
(
    VisitId     INT IDENTITY(1,1) NOT NULL,
    PatientId   INT               NOT NULL,
    DoctorId    INT               NOT NULL,
    VisitDate   DATETIME2         NOT NULL,
    Notes       NVARCHAR(MAX)     NULL,
    CreatedAt   DATETIME2         NOT NULL CONSTRAINT DF_Visits_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt   DATETIME2         NULL,
    CONSTRAINT PK_Visits PRIMARY KEY CLUSTERED (VisitId),
    CONSTRAINT FK_Visits_Patients FOREIGN KEY (PatientId)
        REFERENCES dbo.Patients (PatientId) ON DELETE CASCADE,
    CONSTRAINT FK_Visits_Doctors FOREIGN KEY (DoctorId)
        REFERENCES dbo.Doctors (DoctorId) ON DELETE NO ACTION
);
GO

-- ---------------------------------------------------------------------
-- Table: Diagnoses
-- ---------------------------------------------------------------------
CREATE TABLE dbo.Diagnoses
(
    DiagnosisId        INT IDENTITY(1,1) NOT NULL,
    VisitId            INT               NOT NULL,
    DiagnosisTypeId    INT               NOT NULL,
    DiagnosisTitle     NVARCHAR(200)     NOT NULL,
    Description        NVARCHAR(MAX)     NULL,
    DiagnosisDate      DATE              NOT NULL,
    CreatedAt          DATETIME2         NOT NULL CONSTRAINT DF_Diagnoses_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt          DATETIME2         NULL,
    CONSTRAINT PK_Diagnoses PRIMARY KEY CLUSTERED (DiagnosisId),
    CONSTRAINT FK_Diagnoses_Visits FOREIGN KEY (VisitId)
        REFERENCES dbo.Visits (VisitId) ON DELETE CASCADE,
    CONSTRAINT FK_Diagnoses_DiagnosisTypeMaster FOREIGN KEY (DiagnosisTypeId)
        REFERENCES dbo.DiagnosisTypeMaster (DiagnosisTypeId) ON DELETE NO ACTION
);
GO

-- ---------------------------------------------------------------------
-- Table: Prescriptions
-- NOTE: DiagnosisId FK is NO ACTION, not SET NULL as in the dictionary,
-- to avoid a SQL Server multiple-cascade-path conflict with the
-- Visits -> Prescriptions CASCADE path (see header note).
-- ---------------------------------------------------------------------
CREATE TABLE dbo.Prescriptions
(
    PrescriptionId      INT IDENTITY(1,1) NOT NULL,
    VisitId              INT              NOT NULL,
    DiagnosisId          INT              NULL,
    PrescriptionText     NVARCHAR(MAX)    NOT NULL,
    PdfPath               NVARCHAR(255)   NULL,
    PrescriptionDate     DATE             NOT NULL,
    CreatedAt             DATETIME2       NOT NULL CONSTRAINT DF_Prescriptions_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt             DATETIME2       NULL,
    CONSTRAINT PK_Prescriptions PRIMARY KEY CLUSTERED (PrescriptionId),
    CONSTRAINT FK_Prescriptions_Visits FOREIGN KEY (VisitId)
        REFERENCES dbo.Visits (VisitId) ON DELETE CASCADE,
    CONSTRAINT FK_Prescriptions_Diagnoses FOREIGN KEY (DiagnosisId)
        REFERENCES dbo.Diagnoses (DiagnosisId) ON DELETE NO ACTION
);
GO

-- ---------------------------------------------------------------------
-- Table: MedicalReports
-- NOTE: DiagnosisId and PatientId FKs are NO ACTION, not SET NULL /
-- CASCADE as in the dictionary, to avoid a SQL Server multiple-cascade-
-- path conflict with the Visits -> MedicalReports CASCADE path
-- (see header note).
-- ---------------------------------------------------------------------
CREATE TABLE dbo.MedicalReports
(
    ReportId             INT IDENTITY(1,1) NOT NULL,
    VisitId              INT               NOT NULL,
    DiagnosisId          INT               NULL,
    PatientId            INT               NOT NULL,
    DoctorId             INT               NOT NULL,
    UploadedByUserId     INT               NOT NULL,
    Title                NVARCHAR(200)     NOT NULL,
    ReportType           NVARCHAR(50)      NOT NULL,
    FilePath             NVARCHAR(255)     NOT NULL,
    FileSize             INT               NULL,
    ReportDate           DATE              NULL,
    CreatedAt            DATETIME2         NOT NULL CONSTRAINT DF_MedicalReports_CreatedAt DEFAULT (SYSUTCDATETIME()),
    UpdatedAt            DATETIME2         NULL,
    CONSTRAINT PK_MedicalReports PRIMARY KEY CLUSTERED (ReportId),
    CONSTRAINT FK_MedicalReports_Visits FOREIGN KEY (VisitId)
        REFERENCES dbo.Visits (VisitId) ON DELETE CASCADE,
    CONSTRAINT FK_MedicalReports_Diagnoses FOREIGN KEY (DiagnosisId)
        REFERENCES dbo.Diagnoses (DiagnosisId) ON DELETE NO ACTION,
    CONSTRAINT FK_MedicalReports_Patients FOREIGN KEY (PatientId)
        REFERENCES dbo.Patients (PatientId) ON DELETE NO ACTION,
    CONSTRAINT FK_MedicalReports_Doctors FOREIGN KEY (DoctorId)
        REFERENCES dbo.Doctors (DoctorId) ON DELETE NO ACTION,
    CONSTRAINT FK_MedicalReports_Users FOREIGN KEY (UploadedByUserId)
        REFERENCES dbo.Users (UserId) ON DELETE NO ACTION
);
GO

/* =====================================================================
   SECTION 4: ENGAGEMENT & ADMIN MONITORING
   ===================================================================== */

-- ---------------------------------------------------------------------
-- Table: Notifications
-- ---------------------------------------------------------------------
CREATE TABLE dbo.Notifications
(
    NotificationId    INT IDENTITY(1,1) NOT NULL,
    UserId            INT               NOT NULL,
    Title             NVARCHAR(150)     NOT NULL,
    Message           NVARCHAR(500)     NOT NULL,
    Type              NVARCHAR(30)      NOT NULL,
    IsRead            BIT               NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT (0),
    ReadAt            DATETIME2         NULL,
    EmailSent         BIT               NOT NULL CONSTRAINT DF_Notifications_EmailSent DEFAULT (0),
    EmailSentAt       DATETIME2         NULL,
    CreatedAt         DATETIME2         NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_Notifications PRIMARY KEY CLUSTERED (NotificationId),
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE CASCADE
);
GO

-- ---------------------------------------------------------------------
-- Table: AuditLogs (optional)
-- ---------------------------------------------------------------------
CREATE TABLE dbo.AuditLogs
(
    AuditLogId    BIGINT IDENTITY(1,1) NOT NULL,
    UserId        INT                  NULL,
    Action        NVARCHAR(100)        NOT NULL,
    EntityName    NVARCHAR(50)         NOT NULL,
    EntityId      INT                  NOT NULL,
    IpAddress     NVARCHAR(45)         NULL,
    CreatedAt     DATETIME2            NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_AuditLogs PRIMARY KEY CLUSTERED (AuditLogId),
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users (UserId) ON DELETE SET NULL
);
GO

/* =====================================================================
   SECTION 5: RECOMMENDED INDEXES
   ===================================================================== */

-- Users
CREATE NONCLUSTERED INDEX IX_Users_RoleId ON dbo.Users (RoleId);
GO

-- OTPMaster
CREATE NONCLUSTERED INDEX IX_OTPMaster_UserId_IsUsed ON dbo.OTPMaster (UserId, IsUsed);
GO

-- StateMaster
CREATE NONCLUSTERED INDEX IX_StateMaster_CountryId ON dbo.StateMaster (CountryId);
GO

-- CityMaster
CREATE NONCLUSTERED INDEX IX_CityMaster_StateId ON dbo.CityMaster (StateId);
GO

-- Patients
CREATE NONCLUSTERED INDEX IX_Patients_LastName_FirstName ON dbo.Patients (LastName, FirstName);
CREATE NONCLUSTERED INDEX IX_Patients_CityId ON dbo.Patients (CityId);
GO

-- Doctors
CREATE NONCLUSTERED INDEX IX_Doctors_ApprovalStatus ON dbo.Doctors (ApprovalStatus);
CREATE NONCLUSTERED INDEX IX_Doctors_HospitalId ON dbo.Doctors (HospitalId);
CREATE NONCLUSTERED INDEX IX_Doctors_SpecializationId ON dbo.Doctors (SpecializationId);
GO

-- Visits
CREATE NONCLUSTERED INDEX IX_Visits_Patient_Date ON dbo.Visits (PatientId, VisitDate DESC);
CREATE NONCLUSTERED INDEX IX_Visits_DoctorId ON dbo.Visits (DoctorId);
GO

-- Diagnoses
CREATE NONCLUSTERED INDEX IX_Diagnoses_VisitId ON dbo.Diagnoses (VisitId);
CREATE NONCLUSTERED INDEX IX_Diagnoses_DiagnosisTypeId ON dbo.Diagnoses (DiagnosisTypeId);
CREATE NONCLUSTERED INDEX IX_Diagnoses_DiagnosisDate ON dbo.Diagnoses (DiagnosisDate);
GO

-- Prescriptions
CREATE NONCLUSTERED INDEX IX_Prescriptions_VisitId ON dbo.Prescriptions (VisitId);
CREATE NONCLUSTERED INDEX IX_Prescriptions_DiagnosisId ON dbo.Prescriptions (DiagnosisId);
CREATE NONCLUSTERED INDEX IX_Prescriptions_PrescriptionDate ON dbo.Prescriptions (PrescriptionDate);
GO

-- MedicalReports
CREATE NONCLUSTERED INDEX IX_MedicalReports_PatientId ON dbo.MedicalReports (PatientId);
CREATE NONCLUSTERED INDEX IX_MedicalReports_VisitId ON dbo.MedicalReports (VisitId);
CREATE NONCLUSTERED INDEX IX_MedicalReports_UploadedBy ON dbo.MedicalReports (UploadedByUserId);
GO

-- Notifications
CREATE NONCLUSTERED INDEX IX_Notifications_User_Read ON dbo.Notifications (UserId, IsRead);
GO

-- AuditLogs
CREATE NONCLUSTERED INDEX IX_AuditLogs_User_Date ON dbo.AuditLogs (UserId, CreatedAt DESC);
GO

/* =====================================================================
   END OF SCRIPT
   ===================================================================== */
