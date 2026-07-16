CREATE TABLE dbo.Patients (
    PatientId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL UNIQUE REFERENCES dbo.Users(UserId) ON DELETE CASCADE,
    AarogyamId NVARCHAR(20) NOT NULL UNIQUE,
    FirstName NVARCHAR(50) NOT NULL,
    MiddleName NVARCHAR(50) NULL,
    LastName NVARCHAR(50) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Gender NVARCHAR(10) NOT NULL CHECK (Gender IN ('Male','Female','Other')),
    BloodGroup NVARCHAR(5) NULL,
    Address NVARCHAR(200) NOT NULL,
    CountryId INT NOT NULL REFERENCES dbo.CountryMaster(CountryId),
    StateId INT NOT NULL REFERENCES dbo.StateMaster(StateId),
    CityId INT NOT NULL REFERENCES dbo.CityMaster(CityId),
    EmergencyContact NVARCHAR(20) NULL,
    QrCodePath NVARCHAR(200) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NULL
);
select * from dbo.Patients;
