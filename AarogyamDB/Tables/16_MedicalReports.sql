CREATE TABLE dbo.MedicalReports (
    ReportId INT IDENTITY(1,1) PRIMARY KEY,
    VisitId INT NULL REFERENCES dbo.Visits(VisitId),
    DiagnosisId INT NULL REFERENCES dbo.Diagnoses(DiagnosisId),
    PatientId INT NOT NULL REFERENCES dbo.Patients(PatientId) ON DELETE CASCADE,
    DoctorId INT NOT NULL REFERENCES dbo.Doctors(DoctorId),
    UploadedByUserId INT NOT NULL REFERENCES dbo.Users(UserId),
    Title NVARCHAR(200) NOT NULL,
    ReportType NVARCHAR(50) NOT NULL,
    FilePath NVARCHAR(200) NOT NULL,
    FileSize INT NULL,
    ReportDate DATE NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NULL
);
