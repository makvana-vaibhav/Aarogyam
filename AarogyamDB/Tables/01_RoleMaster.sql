-- Patient, Doctor, Admin
CREATE TABLE dbo.RoleMaster (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT (SYSUTCDATETIME())
);
insert into dbo.RoleMaster (RoleName) values ('Patient');
insert into dbo.RoleMaster (RoleName) values ('Doctor');
insert into dbo.RoleMaster (RoleName) values ('Admin');
