CREATE TABLE dbo.Prescriptions (
    PrescriptionId INT IDENTITY(1,1) PRIMARY KEY,
    VisitId INT NOT NULL REFERENCES dbo.Visits(VisitId) ON DELETE CASCADE,
    DiagnosisId INT NULL REFERENCES dbo.Diagnoses(DiagnosisId),
    PrescriptionText NVARCHAR(MAX) NOT NULL,
    PdfPath NVARCHAR(200) NULL,
    PrescriptionDate DATE NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NULL
);
