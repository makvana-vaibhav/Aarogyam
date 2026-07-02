# Aarogyam – Digital Health Identity
## Database Design & Data Dictionary (MVP)

**Scope:** SQL Server · ASP.NET Core Web API · React · JWT + OTP
**Design goal:** Fully normalized schema — master/lookup tables for every repeating attribute (role, location, hospital, degree, specialization, diagnosis type), with OTP split out of `Users` into its own table.
**Final table count: 18** (17 from the submission + `RoleMaster`, which is referenced by `Users.RoleId` but was not separately defined — see note below).
**Model:** Visit-based healthcare model — every diagnosis, prescription, and report links back to a consultation (`Visit`).

> ⚠️ **Missing-table note:** `Users.RoleId` is documented as `FK → RoleMaster.RoleId`, but `RoleMaster` does not appear as one of the 17 numbered tables in the submission. It has been added here (as table 0) with the same column pattern as your other `*Master` tables (`RoleId`, `RoleName` UNIQUE, `CreatedAt`) so the schema is internally consistent. Flag this with your guide/reviewer — either add it formally to the submission, or replace `RoleId` with the old `CHECK`-constrained `Role NVARCHAR(20)` if a lookup table wasn't intended.

---

## 1. Final Table List

| # | Table | Category |
|---|-------|----------|
| 0 | `RoleMaster` *(inferred — see note above)* | Lookup |
| 1 | `OTPMaster` | Auth |
| 2 | `CountryMaster` | Lookup |
| 3 | `StateMaster` | Lookup |
| 4 | `CityMaster` | Lookup |
| 5 | `HospitalMaster` | Lookup |
| 6 | `DegreeMaster` | Lookup |
| 7 | `SpecializationMaster` | Lookup |
| 8 | `DiagnosisTypeMaster` | Lookup |
| 9 | `Users` | Identity & Auth |
| 10 | `Patients` | Profile |
| 11 | `Doctors` | Profile |
| 12 | `Visits` | Encounter |
| 13 | `Diagnoses` | Medical record |
| 14 | `Prescriptions` | Medical record |
| 15 | `MedicalReports` | Medical record (files) |
| 16 | `Notifications` | Engagement |
| 17 | `AuditLogs` *(optional)* | Admin monitoring |

> **What changed from the earlier design:** OTP is **no longer columns on `Users`** — it is a full table (`OTPMaster`), which supports multiple/expired OTPs per user rather than a single overwritten code. `Role`, `Country`, `State`, `City`, `Hospital`, `Degree`, `Specialization`, and `DiagnosisType` are **no longer free-text or `CHECK`-constrained strings** — every one of them is now a proper lookup/master table with its own surrogate key, matching admin's "Master Data Management" functionality. **`PrescriptionItems` has been removed** — `Prescriptions` now carries a single `PrescriptionText NVARCHAR(MAX)` field instead of structured medicine line items. "Medical History" remains **not a table** — it is still a view/query aggregating Visits + Diagnoses + Prescriptions + Reports for a patient. Vaccination/Surgery remain **not tables** — they are `Diagnoses` rows typed via `DiagnosisTypeId`.

---

## 2. Why Each Table Exists

**0. RoleMaster** *(inferred)* — Lookup for the three user roles (Patient, Doctor, Admin). Replaces the earlier `CHECK`-constrained `Role` string on `Users`, matching the admin "Access Control Management" feature (assign roles / control permissions), which implies roles are managed data, not a hardcoded list.

**1. OTPMaster** — A dedicated table for one-time-password issuance and verification, separate from `Users`. Because OTPs are now rows rather than overwritten columns, the system can keep a history of issued codes, track which one was actually used (`IsUsed`), and avoid race conditions from resending a code mid-verification. Supports both email and phone OTP flows referenced in "Registration & Login."

**2. CountryMaster / 3. StateMaster / 4. CityMaster** — A standard three-level location hierarchy (Country → State → City), each a proper lookup table rather than free text on `Patients`/`Doctors`. This is what the admin's "Master Data Management" functionality (*"Manage countries, states, cities..."*) requires, and it keeps address data clean and filterable (e.g. "find doctors in this city").

**5. HospitalMaster** — Turns the earlier free-text `HospitalName` on `Doctors` into a managed lookup, per admin's master-data responsibilities. Holds the hospital's own address.

**6. DegreeMaster** — New table capturing a doctor's qualifying degree (e.g. MBBS, MD) as a lookup with a short name/abbreviation, supporting the "Doctor Approval Management" document-verification step (degree certificates).

**7. SpecializationMaster** — Promotes the earlier free-text `Specialization` on `Doctors` into a lookup, so specializations can be centrally managed and used for filtering ("find a cardiologist").

**8. DiagnosisTypeMaster** — Promotes the earlier `CHECK`-constrained `DiagnosisType` string (`Disease`/`Vaccination`/`Surgery`/`Allergy`/`Condition`) into a full lookup table with `IsActive`, so admin can add new diagnosis categories without a schema change. Vaccinations and surgeries are still just `Diagnoses` rows whose `DiagnosisTypeId` points here — no separate tables.

**9. Users** — Single authentication table for all three roles. Login, password hash, verification flags, and active/inactive status live here; `RoleId` now points at `RoleMaster` instead of a `CHECK` string. OTP fields have moved out entirely into `OTPMaster`.

**10. Patients** — One-to-one profile for patient users. Holds the permanent `AarogyamId`, name split into First/Middle/Last, demographics, the normalized Country/State/City address, and the QR reference.

**11. Doctors** — One-to-one profile for doctor users. Holds license number, the normalized Hospital/Degree/Specialization references, uploaded verification documents (`LicenseDocumentPath`, `DegreeDocumentPath`), the admin approval workflow (`ApprovalStatus`, `ApprovedByUserId`, `ApprovedAt`, `RejectionReason`), and the doctor's own address.

**12. Visits** — The clinical encounter that parents diagnoses, prescriptions, and reports. `VisitDate` is now a full `DATETIME2` (not just `DATE`), so multiple visits on the same calendar day are distinguishable.

**13. Diagnoses** — A doctor's clinical record, created inside a visit (`VisitId` mandatory). `DiagnosisTypeId` (FK to `DiagnosisTypeMaster`) replaces the old `CHECK`-constrained string — this is how vaccinations/surgeries continue to live in one typed table instead of three. Patient and doctor are now derived through `VisitId` rather than duplicated directly on this table.

**14. Prescriptions** — The prescription record for a visit, with an optional link to a specific diagnosis from that visit. `PrescriptionText` holds the full prescription content as a single block (replacing the earlier header/line-item split), and `PdfPath` stores the generated PDF for download, matching "Prescription Management" (*generate digital prescriptions and downloadable PDF prescriptions*).

**15. MedicalReports** — File metadata for uploaded reports (path, type, size), now linked to the specific `VisitId`/`DiagnosisId` they relate to, in addition to `PatientId` and `DoctorId`, matching "upload and review patient medical reports **linked to consultations**." Actual files stay on disk/blob storage; only metadata is in SQL.

**16. Notifications** — In-app notifications per user, now with `EmailSent`/`EmailSentAt` tracking so the system can record whether the corresponding email notification actually went out, not just that an in-app one was created.

**17. AuditLogs (optional)** — Lightweight activity trail for admin's "Audit & Activity Monitoring" feature. `EntityId` is now mandatory (every audited action targets a specific record). Still the table to drop first if trimming scope.

---

## 3. ER Diagram (Text Format)

```
+--------------+       +---------------+     +----------------+
| RoleMaster   |       | CountryMaster |     | DegreeMaster    |
| PK RoleId    |       | PK CountryId  |     | PK DegreeId     |
+------+-------+       +-------+-------+     +--------+--------+
       | 1:N                   | 1:N                   | 1:N
       v                       v                       v
+----------------+     +---------------+       +------------------+
|     Users      |     | StateMaster   |       |SpecializationMstr|
| PK UserId      |     | PK StateId    |       | PK SpecId        |
| FK RoleId      |     | FK CountryId  |       +---------+--------+
+---+---+---+----+     +-------+-------+                 |
    |   |   |                  | 1:N                     | 1:N
 1:1| 1:1| 1:N (Notif/         v                          v
    |   |    Audit/Report) +----------------+      +----------------+
    |   |                  | CityMaster     |      | HospitalMaster |
    v   v                  | PK CityId      |      | PK HospitalId  |
+--------+  +----------+   | FK StateId     |      +--------+-------+
|Patients|  | Doctors  |   +--------+-------+               |
|PK PatId|  |PK DocId  |            | 1:N (Patients/Doctors)| 1:N
|FK UserId| |FK UserId |            +-----------+-----------+
|FK CtryId|  |FK HospId|                        |
|FK StateId| |FK DegId |                        v
|FK CityId| |FK SpecId |               (address FK on Patients & Doctors)
+---+----+  +----+-----+
    |            |
    | 1:N        | 1:N
    +-----+------+
          v
    +------------+
    |   Visits   |
    | PK VisitId |
    | FK PatId   |
    | FK DocId   |
    +-----+------+
          |
   +------+-------+--------------+
   | 1:N           | 1:N          | 1:N
   v               v              v
+----------+  +---------------+ +----------------+
|Diagnoses |  | Prescriptions | | MedicalReports  |
|PK DiagId |  | PK PrescId    | | PK ReportId     |
|FK VisitId|->| FK VisitId    | | FK VisitId      |
|FK DiagTyp|  | FK DiagId (N) | | FK DiagId (N)   |
+----------+  +---------------+ | FK PatientId    |
                                 | FK DoctorId     |
                                 | FK UploadedBy   |
                                 +-----------------+

Users --1:N--> OTPMaster (PK OtpId, FK UserId)
Users --1:N--> Notifications (PK NotificationId, FK UserId)
Users --1:N--> AuditLogs (PK AuditLogId, FK UserId)
Users --1:N--> MedicalReports.UploadedByUserId
Users --1:N--> Doctors.ApprovedByUserId

Legend: PK = primary key, FK = foreign key, 1:1 / 1:N = cardinality, (N) = nullable FK
```

---

## 4. Relationships

| Parent | Child | Type | FK | On Delete |
|--------|-------|------|----|-----------| 
| RoleMaster | Users | 1 : N | `Users.RoleId` | No Action |
| Users | OTPMaster | 1 : N | `OTPMaster.UserId` | Cascade |
| Users | Patients | 1 : 1 | `Patients.UserId` (UNIQUE) | Cascade |
| Users | Doctors | 1 : 1 | `Doctors.UserId` (UNIQUE) | Cascade |
| Users | Doctors | 1 : N | `Doctors.ApprovedByUserId` | No Action |
| Users | Notifications | 1 : N | `Notifications.UserId` | Cascade |
| Users | MedicalReports | 1 : N | `MedicalReports.UploadedByUserId` | No Action |
| Users | AuditLogs | 1 : N | `AuditLogs.UserId` | Set Null |
| CountryMaster | StateMaster | 1 : N | `StateMaster.CountryId` | No Action |
| StateMaster | CityMaster | 1 : N | `CityMaster.StateId` | No Action |
| CountryMaster | Patients | 1 : N | `Patients.CountryId` | No Action |
| StateMaster | Patients | 1 : N | `Patients.StateId` | No Action |
| CityMaster | Patients | 1 : N | `Patients.CityId` | No Action |
| CountryMaster | Doctors | 1 : N | `Doctors.CountryId` | No Action |
| StateMaster | Doctors | 1 : N | `Doctors.StateId` | No Action |
| CityMaster | Doctors | 1 : N | `Doctors.CityId` | No Action |
| HospitalMaster | Doctors | 1 : N | `Doctors.HospitalId` | No Action |
| DegreeMaster | Doctors | 1 : N | `Doctors.DegreeId` | No Action |
| SpecializationMaster | Doctors | 1 : N | `Doctors.SpecializationId` | No Action |
| DiagnosisTypeMaster | Diagnoses | 1 : N | `Diagnoses.DiagnosisTypeId` | No Action |
| Patients | Visits | 1 : N | `Visits.PatientId` | Cascade |
| Patients | MedicalReports | 1 : N | `MedicalReports.PatientId` | Cascade |
| Doctors | Visits | 1 : N | `Visits.DoctorId` | No Action |
| Doctors | MedicalReports | 1 : N | `MedicalReports.DoctorId` | No Action |
| Visits | Diagnoses | 1 : N | `Diagnoses.VisitId` | Cascade |
| Visits | Prescriptions | 1 : N | `Prescriptions.VisitId` | Cascade |
| Visits | MedicalReports | 1 : N | `MedicalReports.VisitId` | Cascade |
| Diagnoses | Prescriptions | 1 : N | `Prescriptions.DiagnosisId` (nullable) | Set Null |
| Diagnoses | MedicalReports | 1 : N | `MedicalReports.DiagnosisId` (nullable) | Set Null |

> **Lookup tables use No Action:** Country/State/City/Hospital/Degree/Specialization/DiagnosisType/Role are reference data — deleting a lookup row should never silently cascade into real patient or doctor records. Deactivate (`IsActive = 0`) instead of deleting.
>
> **Clinical data cascades from `Visits`, not `Patients`, for Diagnoses/Prescriptions/MedicalReports:** Because `Diagnoses` and `Prescriptions` no longer carry `PatientId` directly (they're reached only through `VisitId`), their cascade path runs `Patients → Visits → Diagnoses/Prescriptions/MedicalReports`, avoiding SQL Server's multiple-cascade-path restriction. `MedicalReports.PatientId` is still a direct FK (for reports not tied to a specific visit, if any), and it also cascades from `Patients` directly — since it's the only direct patient path to that table, this does not conflict with the `Visits → MedicalReports` cascade.
>
> **Doctor links stay No Action**, same rationale as before: a doctor leaving the platform must never destroy a patient's clinical history.

---

## 5. Complete Data Dictionary

Conventions used throughout:
- **PK** surrogate keys: `INT IDENTITY(1,1)`. `AuditLogs` uses `BIGINT` (high row volume).
- **Timestamps**: `DATETIME2`, stored in **UTC**, default `SYSUTCDATETIME()` unless noted.
- **Booleans**: `BIT`.
- **Text**: `NVARCHAR` (Unicode — supports Indian language names).

---

### 5.0 `RoleMaster` *(inferred — not in the numbered list, see note at top)*

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| RoleId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| RoleName | NVARCHAR | 20 | NOT NULL | – | – | – | ✔ |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |

- Expected seed rows: `Patient`, `Doctor`, `Admin`.

---

### 5.1 `OTPMaster`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| OtpId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| UserId | INT | – | – | – | → Users.UserId | – | – |
| OtpCode | NVARCHAR | 10 | NOT NULL | – | – | – | – |
| ExpiresAt | DATETIME2 | – | NOT NULL | – | – | – | – |
| IsUsed | BIT | – | – | – | – | 0 | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |

- **Index:** `IX_OTPMaster_UserId_IsUsed` for the login-verification lookup (latest unused, unexpired code for a user).

---

### 5.2 `CountryMaster`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| CountryId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| CountryName | NVARCHAR | 100 | – | – | – | – | ✔ |
| CountryCode | NVARCHAR | 10 | – | – | – | – | ✔ |
| IsActive | BIT | – | – | – | – | 1 | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

---

### 5.3 `StateMaster`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| StateId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| CountryId | INT | – | – | – | → CountryMaster.CountryId | – | – |
| StateName | NVARCHAR | 100 | NOT NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- **Index:** `IX_StateMaster_CountryId`.

---

### 5.4 `CityMaster`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| CityId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| StateId | INT | – | – | – | → StateMaster.StateId | – | – |
| CityName | NVARCHAR | 100 | NOT NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- **Index:** `IX_CityMaster_StateId`.

---

### 5.5 `HospitalMaster`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| HospitalId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| HospitalName | NVARCHAR | 150 | – | – | – | – | ✔ |
| Address | NVARCHAR | 255 | NOT NULL | – | – | – | – |
| CityId | INT | – | – | – | → CityMaster.CityId | – | – |
| PhoneNumber | NVARCHAR | 15 | NULL | – | – | – | – |
| Email | NVARCHAR | 256 | NULL | – | – | – | – |
| IsActive | BIT | – | – | – | – | 1 | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

---

### 5.6 `DegreeMaster`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| DegreeId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| DegreeName | NVARCHAR | 100 | – | – | – | – | ✔ |
| ShortName | NVARCHAR | 20 | – | – | – | – | ✔ |
| Description | NVARCHAR | 255 | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- Example rows: `MBBS`, `MD – General Medicine`, `MS – Surgery`.

---

### 5.7 `SpecializationMaster`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| SpecializationId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| SpecializationName | NVARCHAR | 100 | – | – | – | – | ✔ |
| Description | NVARCHAR | 255 | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

---

### 5.8 `DiagnosisTypeMaster`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| DiagnosisTypeId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| DiagnosisTypeName | NVARCHAR | 100 | – | – | – | – | ✔ |
| Description | NVARCHAR | 255 | NULL | – | – | – | – |
| IsActive | BIT | – | – | – | – | 1 | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- Expected seed rows: `Disease`, `Vaccination`, `Surgery`, `Allergy`, `Condition`.

---

### 5.9 `Users`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| UserId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| RoleId | INT | – | – | – | → RoleMaster.RoleId | – | – |
| Email | NVARCHAR | 256 | – | – | – | – | ✔ |
| PhoneNumber | NVARCHAR | 15 | – | – | – | – | ✔ |
| PasswordHash | NVARCHAR | 255 | NOT NULL | – | – | – | – |
| IsEmailVerified | BIT | – | – | – | – | 0 | – |
| IsActive | BIT | – | – | – | – | 1 | – |
| LastLoginAt | DATETIME2 | – | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- OTP fields and phone-verification flag have moved to `OTPMaster` (`IsPhoneVerified` should be re-added here or tracked via a successful `OTPMaster` verification — confirm with the team which approach the app layer expects).
- **Indexes:** `UQ_Users_Email`, `UQ_Users_Phone`; `IX_Users_RoleId`.

---

### 5.10 `Patients`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| PatientId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| UserId | INT | – | – | – | → Users.UserId | – | ✔ |
| AarogyamId | NVARCHAR | 20 | – | – | – | – | ✔ |
| FirstName | NVARCHAR | 50 | NOT NULL | – | – | – | – |
| MiddleName | NVARCHAR | 50 | NULL | – | – | – | – |
| LastName | NVARCHAR | 50 | NOT NULL | – | – | – | – |
| DateOfBirth | DATE | – | NOT NULL | – | – | – | – |
| Gender | NVARCHAR | 10 | NOT NULL | – | – | – | – |
| BloodGroup | NVARCHAR | 5 | NULL | – | – | – | – |
| Address | NVARCHAR | 255 | NOT NULL | – | – | – | – |
| CountryId | INT | – | – | – | → CountryMaster.CountryId | – | – |
| StateId | INT | – | – | – | → StateMaster.StateId | – | – |
| CityId | INT | – | – | – | → CityMaster.CityId | – | – |
| EmergencyContact | NVARCHAR | 15 | NULL | – | – | – | – |
| QrCodePath | NVARCHAR | 255 | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- **AarogyamId format suggestion:** `ARG-{YYYY}-{6-digit sequence}`, generated once at registration, never changed.
- **Indexes:** `UQ_Patients_UserId`, `UQ_Patients_AarogyamId`; `IX_Patients_LastName_FirstName` (doctor "search by name"); `IX_Patients_CityId`.

---

### 5.11 `Doctors`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| DoctorId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| UserId | INT | – | – | – | → Users.UserId | – | ✔ |
| FirstName | NVARCHAR | 50 | NOT NULL | – | – | – | – |
| MiddleName | NVARCHAR | 50 | NOT NULL | – | – | – | – |
| LastName | NVARCHAR | 50 | NOT NULL | – | – | – | – |
| LicenseNumber | NVARCHAR | 50 | – | – | – | – | ✔ |
| HospitalId | INT | – | – | – | → HospitalMaster.HospitalId | – | – |
| DegreeId | INT | – | – | – | → DegreeMaster.DegreeId | – | – |
| SpecializationId | INT | – | – | – | → SpecializationMaster.SpecializationId | – | – |
| LicenseDocumentPath | NVARCHAR | 255 | NOT NULL | – | – | – | – |
| DegreeDocumentPath | NVARCHAR | 255 | NOT NULL | – | – | – | – |
| ApprovalStatus | NVARCHAR | 20 | NOT NULL | – | – | – | – |
| ApprovedByUserId | INT | – | NULL | – | → Users.UserId | – | – |
| ApprovedAt | DATETIME2 | – | NULL | – | – | – | – |
| RejectionReason | NVARCHAR | 255 | NULL | – | – | – | – |
| Address | NVARCHAR | 255 | NOT NULL | – | – | – | – |
| CountryId | INT | – | – | – | → CountryMaster.CountryId | – | – |
| StateId | INT | – | – | – | → StateMaster.StateId | – | – |
| CityId | INT | – | – | – | → CityMaster.CityId | – | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- **CHECK (recommended, not yet in submission):** `ApprovalStatus IN ('Pending','Approved','Rejected')`.
- `RejectionReason` is populated only when `ApprovalStatus='Rejected'`.
- **Indexes:** `UQ_Doctors_UserId`, `UQ_Doctors_License`; `IX_Doctors_ApprovalStatus` (admin queue); `IX_Doctors_HospitalId`, `IX_Doctors_SpecializationId`.

---

### 5.12 `Visits`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| VisitId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| PatientId | INT | – | – | – | → Patients.PatientId | – | – |
| DoctorId | INT | – | – | – | → Doctors.DoctorId | – | – |
| VisitDate | DATETIME2 | – | NOT NULL | – | – | – | – |
| Notes | NVARCHAR | MAX | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- `VisitDate` is a full timestamp (not just a date), so same-day visits are distinguishable and sortable.
- **Indexes:** `IX_Visits_Patient_Date` (`PatientId`, `VisitDate` DESC); `IX_Visits_DoctorId`.

---

### 5.13 `Diagnoses`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| DiagnosisId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| VisitId | INT | – | – | – | → Visits.VisitId | – | – |
| DiagnosisTypeId | INT | – | – | – | → DiagnosisTypeMaster.DiagnosisTypeId | – | – |
| DiagnosisTitle | NVARCHAR | 200 | NOT NULL | – | – | – | – |
| Description | NVARCHAR | MAX | NULL | – | – | – | – |
| DiagnosisDate | DATE | – | NOT NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- Patient and doctor are reached through `VisitId` (`Diagnoses → Visits → Patients/Doctors`) rather than duplicated on this table.
- Vaccinations/surgeries are diagnoses whose `DiagnosisTypeId` points to the corresponding `DiagnosisTypeMaster` row.
- **Indexes:** `IX_Diagnoses_VisitId`; `IX_Diagnoses_DiagnosisTypeId`; `IX_Diagnoses_DiagnosisDate`.

---

### 5.14 `Prescriptions`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| PrescriptionId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| VisitId | INT | – | – | – | → Visits.VisitId | – | – |
| DiagnosisId | INT | – | NULL | – | → Diagnoses.DiagnosisId | – | – |
| PrescriptionText | NVARCHAR | MAX | NOT NULL | – | – | – | – |
| PdfPath | NVARCHAR | 255 | NULL | – | – | – | – |
| PrescriptionDate | DATE | – | NOT NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- `PrescriptionText` replaces the earlier `PrescriptionItems` child table — medicines, dosage, frequency, and instructions are now written as a single free-text block rather than structured rows. **Trade-off:** this removes per-medicine search/reporting; note it as a known limitation if a reviewer asks why `PrescriptionItems` disappeared.
- **Indexes:** `IX_Prescriptions_VisitId`; `IX_Prescriptions_DiagnosisId`; `IX_Prescriptions_PrescriptionDate`.

---

### 5.15 `MedicalReports`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| ReportId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| VisitId | INT | – | – | – | → Visits.VisitId | – | – |
| DiagnosisId | INT | – | NULL | – | → Diagnoses.DiagnosisId | – | – |
| PatientId | INT | – | – | – | → Patients.PatientId | – | – |
| DoctorId | INT | – | – | – | → Doctors.DoctorId | – | – |
| UploadedByUserId | INT | – | – | – | → Users.UserId | – | – |
| Title | NVARCHAR | 200 | NOT NULL | – | – | – | – |
| ReportType | NVARCHAR | 50 | NOT NULL | – | – | – | – |
| FilePath | NVARCHAR | 255 | NOT NULL | – | – | – | – |
| FileSize | INT | – | NULL | – | – | – | – |
| ReportDate | DATE | – | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- Now carries both the encounter (`VisitId`) and the specific finding (`DiagnosisId`, nullable) it relates to, plus `PatientId`/`DoctorId`/`UploadedByUserId` for direct querying without always joining through `Visits`.
- `ReportType` remains free text (e.g. `LabReport`, `X-Ray`, `MRI`) — no lookup table for it in this submission (unlike the other classification columns, which were all promoted to masters). Worth flagging as an inconsistency if full normalization is the goal.
- **Indexes:** `IX_MedicalReports_PatientId`; `IX_MedicalReports_VisitId`; `IX_MedicalReports_UploadedBy`.

---

### 5.16 `Notifications`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| NotificationId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| UserId | INT | – | – | – | → Users.UserId | – | – |
| Title | NVARCHAR | 150 | NOT NULL | – | – | – | – |
| Message | NVARCHAR | 500 | NOT NULL | – | – | – | – |
| Type | NVARCHAR | 30 | NOT NULL | – | – | – | – |
| IsRead | BIT | – | – | – | – | 0 | – |
| ReadAt | DATETIME2 | – | NULL | – | – | – | – |
| EmailSent | BIT | – | – | – | – | 0 | – |
| EmailSentAt | DATETIME2 | – | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |

- `EmailSent`/`EmailSentAt` are new — they let the in-app notification record whether the matching email actually went out, useful for retry logic and support debugging.
- **Index:** `IX_Notifications_User_Read` (`UserId`, `IsRead`).

---

### 5.17 `AuditLogs` *(optional)*

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| AuditLogId | BIGINT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| UserId | INT | – | – | – | → Users.UserId | – | – |
| Action | NVARCHAR | 100 | NOT NULL | – | – | – | – |
| EntityName | NVARCHAR | 50 | NOT NULL | – | – | – | – |
| EntityId | INT | – | NOT NULL | – | – | – | – |
| IpAddress | NVARCHAR | 45 | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | – | – | – | Default | – |

- `EntityName` replaces the earlier `EntityType`; `EntityId` is now mandatory (every logged action targets a specific record). The earlier free-text `Details` column has been dropped — confirm this is intentional, since it previously carried human-readable context for each log entry.
- **Index:** `IX_AuditLogs_User_Date` (`UserId`, `CreatedAt` DESC).

---

## Index Recommendations (consolidated)

| Table | Index | Purpose |
|-------|-------|---------|
| Users | UQ Email, UQ Phone | Login + uniqueness |
| Users | IX RoleId | Admin "manage users" filter |
| OTPMaster | IX (UserId, IsUsed) | Verify latest active OTP |
| StateMaster | IX CountryId | Cascading location dropdowns |
| CityMaster | IX StateId | Cascading location dropdowns |
| Patients | UQ AarogyamId, UQ UserId | Identity lookup, 1:1 enforcement |
| Patients | IX (LastName, FirstName) | Doctor search by name |
| Patients | IX CityId | Location-based filtering |
| Doctors | UQ LicenseNumber, UQ UserId | Uniqueness, 1:1 enforcement |
| Doctors | IX ApprovalStatus | Admin approval queue |
| Doctors | IX HospitalId, IX SpecializationId | "Find a doctor" filters |
| Visits | IX (PatientId, VisitDate DESC) | Patient visit timeline |
| Visits | IX DoctorId | Doctor's consultations |
| Diagnoses | IX VisitId | Load diagnoses for a visit |
| Diagnoses | IX DiagnosisTypeId | List vaccinations / surgeries / allergies |
| Prescriptions | IX VisitId | Load prescriptions for a visit |
| Prescriptions | IX DiagnosisId | Prescriptions tied to one diagnosis |
| MedicalReports | IX PatientId, IX VisitId | Patient report list, visit drill-down |
| Notifications | IX (UserId, IsRead) | Unread badge |
| AuditLogs | IX (UserId, CreatedAt DESC) | Admin activity monitoring |

---

## How the Business/Functional Requirements Map to the Schema

| Requirement (from Functionality section) | Enforcement |
|---|---|
| Admin: Manage countries, states, cities, hospitals, degrees, specializations, diagnosis types | `CountryMaster`, `StateMaster`, `CityMaster`, `HospitalMaster`, `DegreeMaster`, `SpecializationMaster`, `DiagnosisTypeMaster` |
| Admin: Assign roles / access control | `RoleMaster` + `Users.RoleId` |
| Admin: Audit & activity monitoring | `AuditLogs` |
| Admin: Doctor approval, document verification | `Doctors.ApprovalStatus/ApprovedByUserId/ApprovedAt/RejectionReason`, `LicenseDocumentPath`, `DegreeDocumentPath` |
| Patient: Email/phone OTP verification | `OTPMaster` + `Users.IsEmailVerified` |
| Patient: Aarogyam ID & QR code | `Patients.AarogyamId` (UNIQUE), `Patients.QrCodePath` |
| Patient: Medical history (visits, diagnoses, prescriptions, reports) | Aggregation view over `Visits` + `Diagnoses` + `Prescriptions` + `MedicalReports` |
| Patient: Upload/access medical reports | `MedicalReports`, `Source` inferred from `UploadedByUserId`'s role |
| Patient: View/download prescriptions | `Prescriptions.PrescriptionText`, `Prescriptions.PdfPath` |
| Doctor: Visit management | `Visits` |
| Doctor: Diagnosis management (incl. vaccination/surgery) | `Diagnoses.DiagnosisTypeId → DiagnosisTypeMaster` |
| Doctor: Prescription + PDF generation | `Prescriptions.PrescriptionText`, `PdfPath` |
| Doctor: Reports linked to consultations | `MedicalReports.VisitId`, `MedicalReports.DiagnosisId` |
| Notifications (approval, reports, appointments, updates) + email tracking | `Notifications.Type`, `EmailSent`, `EmailSentAt` |
| Future: AI-assisted health summaries | No schema change needed — can read existing visit/diagnosis/prescription tables; later add a single `AiSummaries` table or `nvarchar(max)` column |

---

## Open Items to Resolve Before Finalizing

1. **`RoleMaster` is missing from the submitted table list** — add it formally, or revert `Users.RoleId` to a `CHECK`-constrained string.
2. **`Users.IsPhoneVerified`** existed in the earlier design but is absent from the updated `Users` table — confirm whether phone verification status is tracked via `OTPMaster` history only, or should be re-added as a column.
3. **`PrescriptionItems` was removed** in favor of `PrescriptionText NVARCHAR(MAX)` — this trades away structured medicine search/reporting for simplicity. Confirm this is the intended direction before finalizing, since it's a meaningful capability drop from the earlier design.
4. **`MedicalReports.ReportType`** is still free text while every other classification field was promoted to a master table — inconsistent with the rest of the redesign; consider a `ReportTypeMaster` for full consistency.
5. **`AuditLogs.Details`** (free-text context column) was dropped — confirm this was intentional.

---

## Extension Path (post-MVP, do NOT build now)

`Appointments` (scheduling that precedes a `Visit`), consent/sharing tables, and an `AiSummaries` table remain the natural next additions. The lookup-table-heavy design now in place means most future admin-configurable attributes (report types, appointment statuses, etc.) can be added as new `*Master` tables without touching existing ones.
