-- Disease, Vaccination, Surgery, Allergy, Condition
CREATE TABLE dbo.DiagnosisTypeMaster (
    DiagnosisTypeId INT IDENTITY(1,1) PRIMARY KEY,
    DiagnosisTypeName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(200) NULL,
    IsActive BIT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NULL
);
