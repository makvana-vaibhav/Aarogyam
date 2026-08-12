-- Cardiology, Pediatrics ...
CREATE TABLE dbo.SpecializationMaster (
    SpecializationId INT IDENTITY(1,1) PRIMARY KEY,
    DegreeId INT NULL REFERENCES dbo.DegreeMaster(DegreeId),
    SpecializationName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(200) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NULL
);

