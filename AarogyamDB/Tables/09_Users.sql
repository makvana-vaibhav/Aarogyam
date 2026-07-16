CREATE TABLE dbo.Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    RoleId INT NOT NULL REFERENCES dbo.RoleMaster(RoleId),
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PhoneNumber NVARCHAR(20) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(200) NOT NULL,
    IsEmailVerified BIT NOT NULL,
    IsActive BIT NOT NULL,
    LastLoginAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt DATETIME2 NULL
);
select * from dbo.Users;