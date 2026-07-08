CREATE TABLE dbo.Diagnoses (
    DiagnosisId INT IDENTITY(1,1) PRIMARY KEY,
    VisitId INT NOT NULL REFERENCES dbo.Visits(VisitId) ON DELETE CASCADE,
    DiagnosisTypeId INT NOT NULL REFERENCES dbo.DiagnosisTypeMaster(DiagnosisTypeId),
    DiagnosisTitle NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    DiagnosisDate DATE NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NULL
);
