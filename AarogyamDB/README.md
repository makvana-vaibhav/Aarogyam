# Aarogyam Database – AarogyamDB

## 1. Project Introduction

Aarogyam is a Digital Health Identity Platform built as a final year college project. The idea is simple: every citizen gets one health ID (Aarogyam ID) that stores their medical history in one place, instead of having separate paper records at every clinic or hospital they visit.

The system has three types of users — Patients, Doctors, and Admins. Patients can view their health records and prescriptions, Doctors can add visits, diagnoses, and prescriptions for their patients, and Admins manage doctor approvals, manage master/lookup data, and keep the platform running smoothly.

This repository (`AarogyamDB`) contains the complete SQL Server database for the project. The frontend is built in React and the backend is built using ASP.NET Core Web API with Entity Framework Core, but this folder only deals with the database layer. The design here is based on the project's `Aarogyam_Database_Design.md` data dictionary.

## 2. Purpose of the Database

The database is the backbone of the whole project. It needs to:

- Store user accounts and login details for Patients, Doctors, and Admins
- Keep repeating data (roles, locations, hospitals, degrees, specializations, diagnosis types) in proper lookup tables instead of free text
- Keep patient medical history organized visit by visit — every diagnosis, prescription, and report links back to a visit
- Track doctor registration and the admin approval process, including uploaded documents
- Send and log notifications (like "your report is ready")
- Keep an audit trail of important actions for accountability

It is designed to be normalized (no repeated/duplicate data), easy to query, and simple enough for a college-level project while still following real-world database practices.

## 3. Database Architecture

The database follows a straightforward relational design:

- `Users` is the central table for authentication (email, phone, password, role), with `RoleId` pointing to `RoleMaster`
- `Patients` and `Doctors` each extend `Users` with a one-to-one relationship, holding role-specific details
- Repeating attributes are pulled out into their own lookup tables — `CountryMaster`, `StateMaster`, `CityMaster` for addresses, `HospitalMaster`, `DegreeMaster`, `SpecializationMaster` for doctor details, and `DiagnosisTypeMaster` for classifying diagnoses
- `Visits` is the core clinical table — every diagnosis, prescription, and report is linked back to a visit
- Supporting tables (`OTPMaster`, `Notifications`, `AuditLogs`) handle authentication flow, communication, and monitoring

The database uses `IDENTITY` columns as primary keys everywhere (`AuditLogs` uses `BIGINT` since it can grow large), `DATETIME2` for timestamps, and `BIT` for true/false flags. Every table has `CreatedAt` (and `UpdatedAt` where the row can change later) so we always know when a record was added or last modified.

## 4. Folder Structure

```
AarogyamDB/
│
├── README.md
│
├── CreateDatabase.sql
│
├── Tables/
│   ├── 01_RoleMaster.sql
│   ├── 02_CountryMaster.sql
│   ├── 03_StateMaster.sql
│   ├── 04_CityMaster.sql
│   ├── 05_HospitalMaster.sql
│   ├── 06_DegreeMaster.sql
│   ├── 07_SpecializationMaster.sql
│   ├── 08_DiagnosisTypeMaster.sql
│   ├── 09_Users.sql
│   ├── 10_OTPMaster.sql
│   ├── 11_Patients.sql
│   ├── 12_Doctors.sql
│   ├── 13_Visits.sql
│   ├── 14_Diagnoses.sql
│   ├── 15_Prescriptions.sql
│   ├── 16_MedicalReports.sql
│   ├── 17_Notifications.sql
│   └── 18_AuditLogs.sql
│
├── Functions/
│   ├── 1_fnGenerateAarogyamID.sql
│   └── 2_fnCalculateAge.sql
│
└── Procedures/
    ├── 1_spRoleMasterManage.sql        (+ 2_spRoleMasterGet.sql)
    ├── 3_spCountryMasterManage.sql     (+ 4_spCountryMasterGet.sql)
    ├── 5_spStateMasterManage.sql       (+ 6_spStateMasterGet.sql)
    ├── 7_spCityMasterManage.sql        (+ 8_spCityMasterGet.sql)
    ├── 9_spHospitalMasterManage.sql    (+ 10_spHospitalMasterGet.sql)
    ├── 11_spDegreeMasterManage.sql     (+ 12_spDegreeMasterGet.sql)
    ├── 13_spSpecializationMasterManage.sql (+ 14_spSpecializationMasterGet.sql)
    ├── 15_spDiagnosisTypeMasterManage.sql  (+ 16_spDiagnosisTypeMasterGet.sql)
    ├── 17_spUsersManage.sql            (+ 18_spUsersGet.sql)
    ├── 19_spOTPMasterManage.sql        (+ 20_spOTPMasterGet.sql)
    ├── 21_spPatientsManage.sql         (+ 22_spPatientsGet.sql)
    ├── 23_spDoctorsManage.sql          (+ 24_spDoctorsGet.sql)
    ├── 25_spVisitsManage.sql           (+ 26_spVisitsGet.sql)
    ├── 27_spDiagnosesManage.sql        (+ 28_spDiagnosesGet.sql)
    ├── 29_spPrescriptionsManage.sql    (+ 30_spPrescriptionsGet.sql)
    ├── 31_spMedicalReportsManage.sql   (+ 32_spMedicalReportsGet.sql)
    ├── 33_spNotificationsManage.sql    (+ 34_spNotificationsGet.sql)
    └── 35_spAuditLogsManage.sql        (+ 36_spAuditLogsGet.sql)
```

Each file is numbered starting from 1 within its own folder, in the order it should be run. Folders themselves run in the order they appear above (Tables, then Functions, then Procedures).

There is no `Views`, `Triggers`, or `SampleData` folder. Views were dropped because the API querying a view directly would be a direct SQL call, which contradicts "everything goes through a stored procedure" — the join logic they held now lives inside the relevant `Get` procedure instead (e.g. `spPrescriptionsGet @PatientId=...` joins to `Visits` internally). Triggers were dropped for the same reason, in spirit — automatic side effects like "notify the patient when a prescription is created" or "log the doctor approval" now happen because the API explicitly calls `spNotificationsManage` / `spAuditLogsManage` after the relevant action, not because the database silently reacted to an `INSERT`/`UPDATE`. Sample data was just a demo convenience and isn't required for the schema to work.

There is no separate `Constraints` or `Indexes` folder — primary keys, foreign keys, unique constraints, check constraints, defaults, and indexes are all written directly inside each table's `CREATE TABLE` statement in `Tables/`, instead of being added afterwards with `ALTER TABLE` / `CREATE INDEX`. This also means the table files are ordered by dependency (a table can only reference a table created before it), not by the numbering used in the design doc — for example `Users` must exist before `OTPMaster` can reference it, so `Users` is file 09 and `OTPMaster` is file 10, even though the doc lists OTPMaster first.

## 5. Database Modules

The database is organized into five logical modules. All tables live in the default `dbo` schema — no separate schemas are used, to keep the project simple:

| Module | Tables |
|---|---|
| **Lookup / Master Data** | RoleMaster, CountryMaster, StateMaster, CityMaster, HospitalMaster, DegreeMaster, SpecializationMaster, DiagnosisTypeMaster |
| **Authentication** | Users, OTPMaster |
| **Patient** | Patients, Visits, Diagnoses, Prescriptions, MedicalReports |
| **Doctor** | Doctors |
| **Admin / System** | Notifications, AuditLogs |

## 6. Tables Included

| # | Table | Purpose |
|---|-------|---------|
| 1 | RoleMaster | Lookup for the three user roles — Patient, Doctor, Admin |
| 2 | CountryMaster | List of countries used in patient/doctor addresses |
| 3 | StateMaster | States, linked to a country |
| 4 | CityMaster | Cities, linked to a state |
| 5 | HospitalMaster | Hospitals/clinics a doctor can be attached to |
| 6 | DegreeMaster | Medical degrees (MBBS, MD, MS, etc.) |
| 7 | SpecializationMaster | Doctor specializations (Cardiology, Pediatrics, etc.) |
| 8 | DiagnosisTypeMaster | Diagnosis categories (Disease, Vaccination, Surgery, Allergy, Condition) |
| 9 | Users | Login credentials and role for every account |
| 10 | OTPMaster | OTP codes sent for phone/email verification, one row per code |
| 11 | Patients | Patient profile, linked 1:1 to Users |
| 12 | Doctors | Doctor profile, license, and approval details, linked 1:1 to Users |
| 13 | Visits | A single consultation between a patient and a doctor |
| 14 | Diagnoses | Diagnosis recorded during a visit |
| 15 | Prescriptions | Prescription issued during a visit (free-text prescription content) |
| 16 | MedicalReports | Uploaded report files (lab reports, X-rays, etc.) |
| 17 | Notifications | In-app notifications for users, with email-sent tracking |
| 18 | AuditLogs | Log of important actions taken in the system |

> Note: `RoleMaster` was not one of the originally numbered tables in the design doc, but `Users.RoleId` references it, so it is included here to keep the schema consistent. The order above follows creation dependency (a table only references tables created before it), not the order in the design doc.

## 7. Relationships Overview

- `RoleMaster` → `Users` (a role can belong to many users)
- `Users` → `Patients` (1:1) and `Users` → `Doctors` (1:1)
- `CountryMaster` → `StateMaster` → `CityMaster` (address hierarchy, reused by both Patients and Doctors)
- `HospitalMaster`, `DegreeMaster`, `SpecializationMaster` → `Doctors`
- `DiagnosisTypeMaster` → `Diagnoses`
- `Patients` + `Doctors` → `Visits` (a visit always has one patient and one doctor)
- `Visits` → `Diagnoses`, `Visits` → `Prescriptions`, `Visits` → `MedicalReports` (a visit can have many of each)
- `Diagnoses` → `Prescriptions` and `Diagnoses` → `MedicalReports` (optional link — a prescription or report can point to the specific diagnosis it relates to)
- `Users` → `OTPMaster`, `Users` → `Notifications`, `Users` → `AuditLogs`
- `Users` → `Doctors.ApprovedByUserId` (which admin approved a doctor)

All the exact foreign keys and their delete rules are written directly into each table's `CREATE TABLE` statement in `Tables/`. Lookup tables (RoleMaster, CountryMaster, StateMaster, CityMaster, HospitalMaster, DegreeMaster, SpecializationMaster, DiagnosisTypeMaster) use the default `NO ACTION` on delete — they are reference data and should be deactivated, not deleted.

## 8. Constraints Used

Every constraint lives inline inside the table it belongs to (see `Tables/`) — there's no separate constraints step, and only the constraints that are actually needed for the app to work correctly are included:

- **Primary Keys** – every table has its own `IDENTITY` primary key
- **Foreign Keys** – all 30 relationships between tables, written as `REFERENCES` on the column itself. Most use the default `NO ACTION`; a handful use `CASCADE` (e.g. deleting a `Patient` removes their `Visits`) or `SET NULL` (e.g. deleting a `User` clears `AuditLogs.UserId` instead of deleting the log). Two columns on `Prescriptions`/`MedicalReports` are deliberately `NO ACTION` even though they look like they should cascade, because SQL Server does not allow two cascading paths to reach the same table.
- **Check Constraints** – kept to the two that actually matter: `Patients.Gender` and `Doctors.ApprovalStatus` must be one of a fixed list. Things like OTP code length or notification type are validated in the API layer instead, to avoid piling on constraints nobody will hit.
- **Unique Constraints** – `Users.Email`, `Users.PhoneNumber`, `Patients.AarogyamId`, `Doctors.LicenseNumber`, and `Patients.UserId`/`Doctors.UserId` (the last two are what actually makes the "1:1 with Users" relationship true, not just documentation).
- **Default Constraints** – kept to just two things: `CreatedAt` defaults to `SYSUTCDATETIME()` everywhere, and `Doctors.ApprovalStatus` defaults to `'Pending'`. Flags like `IsActive`, `IsRead`, `IsUsed` etc. have no default — the application always sets them explicitly on insert, which is easier to reason about than a hidden default.

## 9. Indexes

There are no explicit indexes right now — `AarogyamId`, `Email`, `PhoneNumber`, and `LicenseNumber` still get one for free from their `UNIQUE` constraint, and every primary key is indexed automatically, but the extra lookup-pattern indexes (visit date, audit log date, patient name search, doctor approval status, unread notifications, cascading location dropdowns) were removed. Not a functional problem at college-project data volumes, but worth revisiting with `CREATE INDEX` (or the inline `INDEX name (column)` table-level syntax) if the data grows or things feel slow.

## 10. Views

There are no views in this project. A view queried directly by the API would be a direct SQL call, which contradicts the "everything goes through a stored procedure" rule below — so the multi-table joins a view would normally hold (patient dashboard, doctor dashboard, patient history, prescription summary) live inside the relevant `Get` procedure's `SELECT` instead, filtered by whatever id the caller passes in.

## 11. Stored Procedures

The API never queries or writes to a table directly — every operation goes through a stored procedure. Each of the 18 tables gets exactly two procedures:

- **`sp<Table>Manage`** – handles insert, update, and delete in one procedure, chosen by an `@Action` parameter (`'INSERT'`, `'UPDATE'`, `'DELETE'`). Insert returns the new row's id; update/delete return a success flag and message.
- **`sp<Table>Get`** – handles "get all" plus every real lookup the app needs, not just the table's own id. Pass nothing to get every row; pass one of the optional filter parameters to narrow it down. Most tables just take their own id, but the ones the app actually queries by relationship or natural key take more:
  - `spUsersGet` — `@UserId` or `@Email` (login needs to find a user by email, not by id it doesn't have yet)
  - `spOTPMasterGet` — `@OtpId` or `@UserId` (returns the latest unused, unexpired OTP for that user)
  - `spPatientsGet` — `@PatientId`, `@UserId`, `@AarogyamId`, or `@SearchName`
  - `spDoctorsGet` — `@DoctorId`, `@UserId`, or `@ApprovalStatus` (the admin approval queue)
  - `spVisitsGet` — `@VisitId`, `@PatientId`, or `@DoctorId`
  - `spDiagnosesGet` — `@DiagnosisId` or `@VisitId`
  - `spPrescriptionsGet` — `@PrescriptionId`, `@VisitId`, or `@PatientId` (joins through `Visits`)
  - `spMedicalReportsGet` — `@ReportId`, `@PatientId`, or `@VisitId`
  - `spNotificationsGet` — `@NotificationId` or `@UserId`
  - `spAuditLogsGet` — `@AuditLogId` or `@UserId`
  - `spStateMasterGet` — `@StateId` or `@CountryId` (cascading location dropdown)
  - `spCityMasterGet` — `@CityId` or `@StateId` (cascading location dropdown)

| Table | Manage procedure | Get procedure |
|---|---|---|
| RoleMaster | spRoleMasterManage | spRoleMasterGet |
| CountryMaster | spCountryMasterManage | spCountryMasterGet |
| StateMaster | spStateMasterManage | spStateMasterGet |
| CityMaster | spCityMasterManage | spCityMasterGet |
| HospitalMaster | spHospitalMasterManage | spHospitalMasterGet |
| DegreeMaster | spDegreeMasterManage | spDegreeMasterGet |
| SpecializationMaster | spSpecializationMasterManage | spSpecializationMasterGet |
| DiagnosisTypeMaster | spDiagnosisTypeMasterManage | spDiagnosisTypeMasterGet |
| Users | spUsersManage | spUsersGet |
| OTPMaster | spOTPMasterManage | spOTPMasterGet |
| Patients | spPatientsManage | spPatientsGet |
| Doctors | spDoctorsManage | spDoctorsGet |
| Visits | spVisitsManage | spVisitsGet |
| Diagnoses | spDiagnosesManage | spDiagnosesGet |
| Prescriptions | spPrescriptionsManage | spPrescriptionsGet |
| MedicalReports | spMedicalReportsManage | spMedicalReportsGet |
| Notifications | spNotificationsManage | spNotificationsGet |
| AuditLogs | spAuditLogsManage | spAuditLogsGet |

36 procedures in total. This replaces the earlier approach of writing one narrowly-named procedure per business action (`spRegisterPatient`, `spCreateVisit`, etc.) — the generic pair per table gives full CRUD coverage everywhere, including the master/lookup tables the admin manages, without needing a new procedure every time a new screen needs a new operation.

## 12. Functions

| Function | What it does |
|---|---|
| fnGenerateAarogyamID | Generates a new, unique Aarogyam ID for a patient |
| fnCalculateAge | Calculates a person's age from their date of birth |

## 13. Triggers

There are no triggers in this project. Side effects that a trigger would have handled automatically — notifying a patient when a prescription is created, notifying a doctor and logging the audit trail when they're approved, logging when a user is activated/disabled — are the API's responsibility: after calling `spPrescriptionsManage`, `spDoctorsManage`, etc., the API is expected to call `spNotificationsManage` / `spAuditLogsManage` itself. Nothing happens silently inside the database.

## 14. Security Considerations

- Passwords are never stored in plain text — only `PasswordHash` is stored, hashing is done in the API layer
- OTPs live in their own table (`OTPMaster`) with an expiry time and an `IsUsed` flag, instead of being overwritten columns on `Users`
- Doctors cannot access the system until an Admin approves their account, and license/degree documents are stored for verification
- Every sensitive action (approvals, rejections, deletions) is written to `AuditLogs`
- Foreign keys use `NO ACTION` for role-based and lookup references (like `ApprovedByUserId` or `HospitalId`) so deleting one row can't accidentally wipe out someone else's history
- The API never runs raw `SELECT`/`INSERT`/`UPDATE`/`DELETE` against a table directly — everything goes through the `sp<Table>Manage`/`sp<Table>Get` procedures in `Procedures/`. This keeps data access in one place and closes off ad-hoc query injection from the app layer

## 15. Naming Conventions

- Tables: PascalCase, plural where it makes sense (`Patients`, `Visits`), lookup tables end in `Master` (`RoleMaster`, `CityMaster`)
- Columns: PascalCase (`FirstName`, `CreatedAt`)
- Primary Keys: `<TableName>Id` (`PatientId`, `VisitId`)
- Foreign Keys: same name as the primary key they point to
- Stored Procedures: prefixed with `sp`, suffixed with `Manage` or `Get` (`spPatientsManage`, `spPatientsGet`)
- Functions: prefixed with `fn` (`fnCalculateAge`)
- Table-level constraints (PK/FK/CHECK/UNIQUE/DEFAULT) are left unnamed and inline in `Tables/`, so SQL Server names them automatically — there's no separate constraints file to keep names in sync with

## 16. How to Execute SQL Files (Step-by-Step)

1. Open SQL Server Management Studio (SSMS) and connect to your local SQL Server instance.
2. Run `CreateDatabase.sql` to create the `AarogyamDB` database.
3. Open the `Tables` folder and run every file in order, `1` through `18` — this also creates every primary key, foreign key, unique, check, and default constraint, since they're all inline.
4. Run all files in the `Functions` folder, `1` through `2`.
5. Run all files in the `Procedures` folder, `1` through `36`.

Basically: follow the numbers in order and you can't go wrong.

## 17. Future Enhancements

- Add an `Appointments` table so patients can book visits in advance instead of only recording past visits
- Add a consent/sharing system so patients can control which doctors can view their full history
- Add a `ReportTypeMaster` lookup table so `MedicalReports.ReportType` is normalized like the other classification columns
- Add full-text search on medical reports and prescriptions
- Add an `AiSummaries` table for AI-assisted health summaries

## 18. Conclusion

This database was designed to keep things simple without cutting corners on good practice — proper keys, proper constraints, and a clear separation between tables, views, procedures, and triggers. Repeating attributes like role, location, hospital, degree, specialization, and diagnosis type all live in their own lookup tables instead of being free text, which matches the admin's master-data management requirement. It supports everything the Aarogyam platform needs for a college submission: patient records, doctor workflows, and admin oversight, while still being easy for anyone to read through and understand file by file.
