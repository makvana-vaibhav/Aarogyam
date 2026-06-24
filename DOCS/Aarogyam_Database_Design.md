# Aarogyam – Digital Health Identity
## Database Design & Data Dictionary (MVP)

**Scope:** SQL Server · ASP.NET Core Web API · React · JWT + OTP
**Design goal:** Smallest realistic schema that delivers every listed core feature, extensible into a product later.
**Final table count: 10** (9 mandatory + 1 optional `AuditLogs`).
**Model:** Visit-based healthcare model — every diagnosis and prescription belongs to a consultation (`Visit`).

---

## 1. Final Table List

| # | Table | Category |
|---|-------|----------|
| 1 | `Users` | Identity & Auth |
| 2 | `Patients` | Profile |
| 3 | `Doctors` | Profile |
| 4 | `Visits` | Encounter |
| 5 | `Diagnoses` | Medical record |
| 6 | `Prescriptions` | Medical record |
| 7 | `PrescriptionItems` | Medical record (child) |
| 8 | `MedicalReports` | Medical record (files) |
| 9 | `Notifications` | Engagement |
| 10 | `AuditLogs` *(optional)* | Admin monitoring |

> **Note on what is intentionally NOT a table:** "Medical History" is **not** a table — it is a *view/query* that aggregates Visits + Diagnoses + Prescriptions + Reports for one patient. **Vaccination and Surgery are no longer tables** — they are now values of `Diagnoses.DiagnosisType` (`'Vaccination'`, `'Surgery'`), so all clinical events live in one place. OTP is **not** a table — it lives as columns on `Users`. There are **no lookup/master tables** (blood group, role, specialization, report type, diagnosis type); these are short free-text or `CHECK`-constrained string columns, which is the right trade-off at this scale.

---

## 2. Why Each Table Exists

**1. Users** — A single authentication table for all three roles (Patient, Doctor, Admin). Login, password hash, email/phone, OTP fields, and active/inactive status all live here. One auth table avoids duplicating login logic three times. The `Role` column plus a `CHECK` constraint separates the three user types. Admins need no extra profile table, so they exist only as rows here.

**2. Patients** — One-to-one profile for users whose role is Patient. Holds the permanent `AarogyamId`, demographic data, and the QR reference. Kept separate from `Users` because patient profile fields are irrelevant to doctors/admins and would otherwise be nullable clutter on `Users`.

**3. Doctors** — One-to-one profile for doctor users. Holds license number, specialization, and the **admin approval** workflow (`ApprovalStatus`, `ApprovedBy`, `ApprovedAt`, and `RejectionReason` for when an application is declined). Separated for the same reason as Patients, and because approval is a doctor-only concept.

**4. Visits** — A `Visit` represents a single consultation between a patient and a doctor (the clinical encounter). It exists so that every diagnosis and prescription has a clear "when and with whom" parent: instead of clinical records floating loose against a patient, they are grouped under the visit in which they happened. This mirrors how real healthcare works (an encounter produces diagnoses and prescriptions), makes the patient timeline easy to render visit-by-visit, and gives a single natural place for the consultation's chief complaint and overall notes. `Diagnoses.VisitId` and `Prescriptions.VisitId` are mandatory, enforcing the rule that nothing clinical exists outside a visit.

**5. Diagnoses** — A doctor's clinical record for a patient, always created inside a visit (`VisitId` mandatory) and always written by a doctor (`DoctorId` mandatory), which is how the "patients cannot create/modify diagnoses" rule is enforced — the patient never owns a write path to this table. The `DiagnosisType` column classifies each entry (`Disease`, `Vaccination`, `Surgery`, `Allergy`, `Condition`). This is the reason vaccinations and surgeries no longer need their own tables: a vaccination is simply a diagnosis with `DiagnosisType='Vaccination'`, and a surgery is one with `DiagnosisType='Surgery'`. One typed table replaces three.

**6. Prescriptions** — The prescription header: which visit, which patient, which doctor, optional link to a diagnosis, general notes, prescription date, and the generated PDF path. `VisitId` is mandatory — every prescription belongs to a visit. The header/line split is standard and is what makes clean PDF generation possible.

**7. PrescriptionItems** — The medicine lines of a prescription (drug name, dosage, frequency, duration, instructions). This child table is *not* overengineering: a prescription naturally has many medicines, and storing them as text/JSON would block searching, reporting, and proper PDF layout.

**8. MedicalReports** — File metadata for uploaded reports (path, type, size, who uploaded it). Covers both patient-uploaded historical reports and doctor-uploaded reports — the `Source` column distinguishes them. Actual files live on disk/blob storage; only metadata is in SQL.

**9. Notifications** — In-app notifications per user (read/unread). Email notifications are *sent*, not stored, so they need no table; in-app ones must persist, so they do.

**10. AuditLogs (optional)** — Lightweight activity trail for the admin "monitor activity" feature. **If you want to trim to exactly 9 tables, this is the one to drop** and add in a later sprint.

---

## 3. ER Diagram (Text Format)

```
                          +-----------------+
                          |     Users       |
                          | PK UserId       |
                          | Email (U)       |
                          | PhoneNumber (U) |
                          | Role            |
                          +--------+--------+
            1:1   +----------------+----+----------------+
        +---------+                |    | 1:N (recipient)|
        |                          |    |                | 1:N (uploader)
        v 1:1                      v    v                v
+----------------+        +----------------+    +----------------+
|   Patients     |        |    Doctors     |    | Notifications  |
| PK PatientId   |        | PK DoctorId    |    | PK NotifId     |
| FK UserId (U)  |        | FK UserId (U)  |    | FK UserId      |
| AarogyamId (U) |        | License# (U)   |    +----------------+
+--+----------+--+        | ApprovalStatus |
   |          |           | RejectionReason|    +----------------+
   |          |           +---+------------+    |   AuditLogs    |
   |          |               |                 | PK AuditLogId  |
   |          |               |                 | FK UserId (N)  |
   | 1:N      |               | 1:N             +----------------+
   |          |               |
   |          +-----------+   |   (Visits.PatientId + Visits.DoctorId)
   v                      v   v
+----------------+      +----------------+
| MedicalReports |      |     Visits     |
| PK ReportId    |      | PK VisitId     |
| FK PatientId   |      | FK PatientId   |
| FK UploadedBy  |      | FK DoctorId    |
+----------------+      +-------+--------+
                               |
                  1:N          |          1:N
            +------------------+------------------+
            v                                     v
     +----------------+                  +----------------+
     |   Diagnoses    |                  | Prescriptions  |
     | PK DiagnosisId |                  | PK PrescId     |
     | FK VisitId     |                  | FK VisitId     |
     | FK PatientId   |                  | FK PatientId   |
     | FK DoctorId    |  1:N (optional)  | FK DoctorId    |
     | DiagnosisType  |----------------->| FK DiagId (N)  |
     +----------------+                  +-------+--------+
                                                 | 1:N
                                                 v
                                        +------------------+
                                        |PrescriptionItems |
                                        | PK ItemId        |
                                        | FK PrescriptionId|
                                        +------------------+

Legend: PK = primary key, FK = foreign key, (U) = unique, (N) = nullable FK, 1:1 / 1:N = cardinality
```

---

## 4. Relationships

| Parent | Child | Type | FK | On Delete |
|--------|-------|------|----|-----------| 
| Users | Patients | 1 : 1 | `Patients.UserId` (UNIQUE) | Cascade |
| Users | Doctors | 1 : 1 | `Doctors.UserId` (UNIQUE) | Cascade |
| Users | Doctors | 1 : N | `Doctors.ApprovedByUserId` | No Action |
| Users | Notifications | 1 : N | `Notifications.UserId` | Cascade |
| Users | MedicalReports | 1 : N | `MedicalReports.UploadedByUserId` | No Action |
| Users | AuditLogs | 1 : N | `AuditLogs.UserId` | Set Null |
| Patients | Visits | 1 : N | `Visits.PatientId` | Cascade |
| Patients | Diagnoses | 1 : N | `Diagnoses.PatientId` | Cascade |
| Patients | Prescriptions | 1 : N | `Prescriptions.PatientId` | Cascade |
| Patients | MedicalReports | 1 : N | `MedicalReports.PatientId` | Cascade |
| Doctors | Visits | 1 : N | `Visits.DoctorId` | No Action |
| Doctors | Diagnoses | 1 : N | `Diagnoses.DoctorId` | No Action |
| Doctors | Prescriptions | 1 : N | `Prescriptions.DoctorId` | No Action |
| Visits | Diagnoses | 1 : N | `Diagnoses.VisitId` | No Action |
| Visits | Prescriptions | 1 : N | `Prescriptions.VisitId` | No Action |
| Diagnoses | Prescriptions | 1 : N | `Prescriptions.DiagnosisId` (nullable) | Set Null |
| Prescriptions | PrescriptionItems | 1 : N | `PrescriptionItems.PrescriptionId` | Cascade |

> **Cascade vs No Action:** Profile/medical rows cascade from the patient (deleting a patient removes their visits, diagnoses, prescriptions, and reports). Doctor links use **No Action** so a doctor leaving the platform never silently destroys a patient's record — those must be preserved for medico-legal reasons.
>
> **Why `Visits → Diagnoses` / `Visits → Prescriptions` are No Action (not Cascade):** Diagnoses and Prescriptions already cascade directly from `Patients`, so making the Visit links cascade too would create **multiple cascade paths**, which SQL Server rejects. No Action here also protects records — a visit that still has diagnoses/prescriptions cannot be accidentally deleted, while deleting the *patient* still cleans everything up via the direct patient cascades.

---

## 5. Complete Data Dictionary

Conventions used throughout:
- **PK** surrogate keys: `INT IDENTITY(1,1)`. `AuditLogs`/`Notifications` use `BIGINT` (high row volume).
- **Timestamps**: `DATETIME2(0)`, stored in **UTC**, default `SYSUTCDATETIME()`.
- **Booleans**: `BIT`.
- **Text**: `NVARCHAR` (Unicode — supports Indian language names).
- **Audit columns**: every table has `CreatedAt`; mutable tables also have `UpdatedAt` (app sets it on update; child line tables omit it).

> Sections 5.1, 5.2, 5.7, 5.8, 5.9, 5.10 are unchanged from the previous design and are included for completeness. Changed/new tables: **5.3 Doctors**, **5.4 Visits (new)**, **5.5 Diagnoses**, **5.6 Prescriptions**.

---

### 5.1 `Users`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| UserId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| Email | NVARCHAR | 256 | NOT NULL | – | – | – | ✔ |
| PhoneNumber | NVARCHAR | 15 | NOT NULL | – | – | – | ✔ |
| PasswordHash | NVARCHAR | 255 | NOT NULL | – | – | – | – |
| Role | NVARCHAR | 20 | NOT NULL | – | – | – | – |
| IsEmailVerified | BIT | – | NOT NULL | – | – | 0 | – |
| IsPhoneVerified | BIT | – | NOT NULL | – | – | 0 | – |
| OtpCode | NVARCHAR | 10 | NULL | – | – | – | – |
| OtpExpiresAt | DATETIME2 | – | NULL | – | – | – | – |
| IsActive | BIT | – | NOT NULL | – | – | 1 | – |
| LastLoginAt | DATETIME2 | – | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- **CHECK:** `Role IN ('Patient','Doctor','Admin')`
- **Indexes:** `UQ_Users_Email`, `UQ_Users_Phone` (both unique); `IX_Users_Role` (filter users by role for admin screens).

---

### 5.2 `Patients`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| PatientId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| UserId | INT | – | NOT NULL | – | → Users.UserId | – | ✔ |
| AarogyamId | NVARCHAR | 20 | NOT NULL | – | – | – | ✔ |
| FullName | NVARCHAR | 100 | NOT NULL | – | – | – | – |
| DateOfBirth | DATE | – | NULL | – | – | – | – |
| Gender | NVARCHAR | 10 | NULL | – | – | – | – |
| BloodGroup | NVARCHAR | 5 | NULL | – | – | – | – |
| Address | NVARCHAR | 255 | NULL | – | – | – | – |
| EmergencyContact | NVARCHAR | 15 | NULL | – | – | – | – |
| QrCodePath | NVARCHAR | 255 | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- **CHECK:** `Gender IN ('Male','Female','Other')`
- **AarogyamId format suggestion:** `ARG-{YYYY}-{6-digit sequence}` e.g. `ARG-2026-000123`. Generated once at registration, never changed. The QR code encodes either this ID or a URL containing it.
- **Indexes:** `UQ_Patients_UserId`, `UQ_Patients_AarogyamId`; `IX_Patients_FullName` (doctor "search by name"). Doctor "search by mobile" hits `Users.PhoneNumber` via the join.

---

### 5.3 `Doctors`  *(updated — added `RejectionReason`)*

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| DoctorId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| UserId | INT | – | NOT NULL | – | → Users.UserId | – | ✔ |
| FullName | NVARCHAR | 100 | NOT NULL | – | – | – | – |
| Specialization | NVARCHAR | 100 | NULL | – | – | – | – |
| LicenseNumber | NVARCHAR | 50 | NOT NULL | – | – | – | ✔ |
| HospitalName | NVARCHAR | 150 | NULL | – | – | – | – |
| ApprovalStatus | NVARCHAR | 20 | NOT NULL | – | – | 'Pending' | – |
| ApprovedByUserId | INT | – | NULL | – | → Users.UserId | – | – |
| ApprovedAt | DATETIME2 | – | NULL | – | – | – | – |
| RejectionReason | NVARCHAR | 255 | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- **CHECK:** `ApprovalStatus IN ('Pending','Approved','Rejected')`
- **`RejectionReason`** is populated only when the admin rejects an application (`ApprovalStatus='Rejected'`); stays `NULL` otherwise. It lets the doctor see *why* they were declined.
- **Indexes:** `UQ_Doctors_UserId`, `UQ_Doctors_License`; `IX_Doctors_ApprovalStatus` (admin approval queue).

---

### 5.4 `Visits`  *(new)*

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| VisitId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| PatientId | INT | – | NOT NULL | – | → Patients.PatientId | – | – |
| DoctorId | INT | – | NOT NULL | – | → Doctors.DoctorId | – | – |
| VisitDate | DATE | – | NOT NULL | – | – | CAST(SYSUTCDATETIME() AS DATE) | – |
| ChiefComplaint | NVARCHAR | 255 | NULL | – | – | – | – |
| Notes | NVARCHAR | MAX | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- A `Visit` is the parent encounter for diagnoses and prescriptions. `ChiefComplaint` captures why the patient came in; `Notes` holds the doctor's overall consultation notes.
- **Indexes:** `IX_Visits_Patient_Date` (`PatientId`, `VisitDate` DESC) for the patient's visit timeline; `IX_Visits_DoctorId`.

---

### 5.5 `Diagnoses`  *(updated — added `VisitId`, `DiagnosisType`)*

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| DiagnosisId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| VisitId | INT | – | NOT NULL | – | → Visits.VisitId | – | – |
| PatientId | INT | – | NOT NULL | – | → Patients.PatientId | – | – |
| DoctorId | INT | – | NOT NULL | – | → Doctors.DoctorId | – | – |
| DiagnosisType | NVARCHAR | 20 | NOT NULL | – | – | 'Disease' | – |
| DiagnosisTitle | NVARCHAR | 200 | NOT NULL | – | – | – | – |
| Description | NVARCHAR | MAX | NULL | – | – | – | – |
| DiagnosisDate | DATE | – | NOT NULL | – | – | CAST(SYSUTCDATETIME() AS DATE) | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- **CHECK:** `DiagnosisType IN ('Disease','Vaccination','Surgery','Allergy','Condition')`
- Vaccinations and surgeries are now stored here as diagnoses with `DiagnosisType='Vaccination'` / `'Surgery'` — no separate tables. For a vaccination, `DiagnosisTitle` holds the vaccine name (e.g. `Covishield – Dose 2`); for a surgery, the procedure name (e.g. `Appendectomy`), with detail in `Description`.
- **Indexes:** `IX_Diagnoses_Patient_Date` (`PatientId`, `DiagnosisDate` DESC) for the history timeline; `IX_Diagnoses_VisitId` (load all diagnoses for a visit); `IX_Diagnoses_Patient_Type` (`PatientId`, `DiagnosisType`) to list a patient's vaccinations/surgeries/allergies; `IX_Diagnoses_DoctorId`.

---

### 5.6 `Prescriptions`  *(updated — added `VisitId`)*

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| PrescriptionId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| VisitId | INT | – | NOT NULL | – | → Visits.VisitId | – | – |
| PatientId | INT | – | NOT NULL | – | → Patients.PatientId | – | – |
| DoctorId | INT | – | NOT NULL | – | → Doctors.DoctorId | – | – |
| DiagnosisId | INT | – | NULL | – | → Diagnoses.DiagnosisId | – | – |
| Notes | NVARCHAR | MAX | NULL | – | – | – | – |
| PrescriptionDate | DATE | – | NOT NULL | – | – | CAST(SYSUTCDATETIME() AS DATE) | – |
| PdfPath | NVARCHAR | 255 | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- `VisitId` is mandatory — every prescription belongs to a visit. `DiagnosisId` stays optional (a prescription may or may not target one specific diagnosis from that visit).
- **Indexes:** `IX_Prescriptions_Patient_Date` (`PatientId`, `PrescriptionDate` DESC); `IX_Prescriptions_VisitId` (load all prescriptions for a visit); `IX_Prescriptions_DoctorId`.

---

### 5.7 `PrescriptionItems`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| PrescriptionItemId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| PrescriptionId | INT | – | NOT NULL | – | → Prescriptions.PrescriptionId | – | – |
| MedicineName | NVARCHAR | 150 | NOT NULL | – | – | – | – |
| Dosage | NVARCHAR | 50 | NULL | – | – | – | – |
| Frequency | NVARCHAR | 50 | NULL | – | – | – | – |
| Duration | NVARCHAR | 50 | NULL | – | – | – | – |
| Instructions | NVARCHAR | 255 | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |

- Example values: Dosage `500 mg`, Frequency `1-0-1`, Duration `5 days`, Instructions `After food`.
- **Index:** `IX_PrescriptionItems_PrescriptionId`. (No `UpdatedAt` — line items are deleted/re-added rather than edited in place.)

---

### 5.8 `MedicalReports`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| ReportId | INT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| PatientId | INT | – | NOT NULL | – | → Patients.PatientId | – | – |
| UploadedByUserId | INT | – | NOT NULL | – | → Users.UserId | – | – |
| Title | NVARCHAR | 200 | NOT NULL | – | – | – | – |
| ReportType | NVARCHAR | 50 | NULL | – | – | – | – |
| FilePath | NVARCHAR | 255 | NOT NULL | – | – | – | – |
| FileSizeKB | INT | – | NULL | – | – | – | – |
| ContentType | NVARCHAR | 100 | NULL | – | – | – | – |
| Source | NVARCHAR | 20 | NOT NULL | – | – | 'Patient' | – |
| ReportDate | DATE | – | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |
| UpdatedAt | DATETIME2 | – | NULL | – | – | – | – |

- **CHECK:** `Source IN ('Patient','Doctor')` — distinguishes patient-uploaded historical reports from doctor uploads.
- `ReportType` is free text (e.g. `LabReport`, `X-Ray`, `MRI`) — no lookup table at MVP.
- **Indexes:** `IX_MedicalReports_PatientId`; `IX_MedicalReports_UploadedBy`.

---

### 5.9 `Notifications`

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| NotificationId | BIGINT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| UserId | INT | – | NOT NULL | – | → Users.UserId | – | – |
| Title | NVARCHAR | 150 | NOT NULL | – | – | – | – |
| Message | NVARCHAR | 500 | NOT NULL | – | – | – | – |
| Type | NVARCHAR | 30 | NULL | – | – | – | – |
| IsRead | BIT | – | NOT NULL | – | – | 0 | – |
| ReadAt | DATETIME2 | – | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |

- `Type` is free text (e.g. `DoctorApproval`, `NewReport`, `Info`).
- **Index:** `IX_Notifications_User_Read` (`UserId`, `IsRead`) for the unread-count badge.

---

### 5.10 `AuditLogs` *(optional)*

| Column | Data Type | Length | Nullable | PK | FK | Default | Unique |
|--------|-----------|--------|----------|----|----|---------|--------|
| AuditLogId | BIGINT IDENTITY | – | NOT NULL | ✔ | – | – | – |
| UserId | INT | – | NULL | – | → Users.UserId | – | – |
| Action | NVARCHAR | 100 | NOT NULL | – | – | – | – |
| EntityType | NVARCHAR | 50 | NULL | – | – | – | – |
| EntityId | INT | – | NULL | – | – | – | – |
| Details | NVARCHAR | 500 | NULL | – | – | – | – |
| IpAddress | NVARCHAR | 45 | NULL | – | – | – | – |
| CreatedAt | DATETIME2 | – | NOT NULL | – | – | SYSUTCDATETIME() | – |

- Examples: `Action='DoctorApproved'`, `EntityType='Doctor'`, `EntityId=12`.
- **Index:** `IX_AuditLogs_User_Date` (`UserId`, `CreatedAt` DESC).

---

## Index Recommendations (consolidated)

| Table | Index | Purpose |
|-------|-------|---------|
| Users | UQ Email, UQ Phone | Login + uniqueness |
| Users | IX Role | Admin "manage users" filter |
| Patients | UQ AarogyamId, UQ UserId | Identity lookup, 1:1 enforcement |
| Patients | IX FullName | Doctor search by name |
| Doctors | UQ LicenseNumber, UQ UserId | Uniqueness, 1:1 enforcement |
| Doctors | IX ApprovalStatus | Admin approval queue |
| Visits | IX (PatientId, VisitDate DESC) | Patient visit timeline |
| Visits | IX DoctorId | Doctor's consultations |
| Diagnoses | IX (PatientId, DiagnosisDate DESC) | History timeline |
| Diagnoses | IX VisitId | Load diagnoses for a visit |
| Diagnoses | IX (PatientId, DiagnosisType) | List vaccinations / surgeries / allergies |
| Prescriptions | IX (PatientId, PrescriptionDate DESC) | History timeline |
| Prescriptions | IX VisitId | Load prescriptions for a visit |
| PrescriptionItems | IX PrescriptionId | Load lines for PDF |
| MedicalReports | IX PatientId | Patient report list |
| Notifications | IX (UserId, IsRead) | Unread badge |

Primary keys are clustered by default; the FK + date composite indexes above cover the heavy read paths (patient timeline, visit drill-down, doctor approval queue, search).

---

## Audit Column Strategy

- **`CreatedAt`** on every table, default `SYSUTCDATETIME()`, set by the database.
- **`UpdatedAt`** on every mutable table — set by the application (or an EF Core `SaveChanges` override) on update; left `NULL` until first edit. Omitted on `PrescriptionItems`, `Notifications`, and `AuditLogs` (these are insert-only / replace-only).
- Store everything in **UTC**; convert to IST in the UI layer.
- "Who created/approved" is captured by explicit FK columns (`UploadedByUserId`, `ApprovedByUserId`, `DoctorId`) rather than a generic `CreatedBy`, which keeps relationships queryable.

---

## How the Business Rules Map to the Schema

| Business rule | Enforcement |
|---------------|-------------|
| Every diagnosis and prescription belongs to a visit | `Diagnoses.VisitId` and `Prescriptions.VisitId` are `NOT NULL` (FK → `Visits`). |
| Patients cannot modify diagnoses/prescriptions | These tables are written only via doctor-authorized endpoints; patient has read-only access (app-layer authorization). `DoctorId` is mandatory on both. |
| Doctors create medical records | `Diagnoses.DoctorId` and `Prescriptions.DoctorId` are `NOT NULL`. |
| Vaccinations are recorded | As a diagnosis with `Diagnoses.DiagnosisType='Vaccination'` (vaccine name in `DiagnosisTitle`). No separate table. |
| Surgeries are recorded | As a diagnosis with `Diagnoses.DiagnosisType='Surgery'` (procedure in `DiagnosisTitle`, detail in `Description`). No separate table. |
| Patients may upload historical reports | `MedicalReports.Source='Patient'`, `UploadedByUserId` = patient's user. |
| One permanent Aarogyam ID per patient | `Patients.AarogyamId` is `UNIQUE`, generated once, never updated. |
| QR linked to identity | `Patients.QrCodePath`; QR encodes the AarogyamId. |
| Doctor approval required | `Doctors.ApprovalStatus` defaults to `'Pending'`; only `'Approved'` doctors can log in / write records. |
| Doctor rejection reason captured | `Doctors.RejectionReason` is set when `ApprovalStatus='Rejected'`. |
| Email + in-app notifications | Email sent at send-time; in-app persisted in `Notifications`. |
| Future AI feature | No schema change needed now — an AI summary can read the existing visit/medical-history tables and (later) store output in a single new `nvarchar(max)` column or a small `AiSummaries` table. |

---

## Extension Path (post-MVP, do NOT build now)

When this grows into a product, the natural additions are: `Appointments` (scheduling that precedes a `Visit`), `Hospitals` (turning `HospitalName` text into an FK), lookup tables for `Specializations` / `ReportTypes` / `DiagnosisTypes`, `AiSummaries`, and consent/sharing tables. The current schema accepts all of these without restructuring — every "name" text field and `CHECK`-constrained type column can later be promoted to an FK.
