# Aarogyam

# Aarogyam Backend - Initial Project Setup

This document covers the initial setup of the ASP.NET Core Web API project before implementing any modules.

---

# Step 1: Create Solution

## Command

```bash
dotnet new sln -n Aarogyam
```

## What is a Solution?

A Solution (`.sln`) is a container that holds one or more .NET projects.

Example:

```text
Aarogyam.sln
│
├── Aarogyam.API
├── Aarogyam.Admin
├── Aarogyam.Tests
```

Currently our solution contains only one project:

```text
Aarogyam.sln
│
└── Aarogyam.API
```

## Why do we need it?

- Organizes multiple projects
- Opens the complete application in Visual Studio or VS Code
- Manages project references

---

# Step 2: Create ASP.NET Core Web API Project

## Command

```bash
dotnet new webapi -n Aarogyam.API
```

## What does this command do?

Creates a new ASP.NET Core Web API project.

Generated structure:

```text
Aarogyam.API
│
├── Program.cs
├── appsettings.json
├── appsettings.Development.json
├── Controllers
├── Properties
├── Aarogyam.API.csproj
```

## Why do we use Web API?

ASP.NET Core Web API acts as the backend of the application.

Flow:

```text
React
    ↓
ASP.NET Core Web API
    ↓
SQL Server
```

The Web API receives HTTP requests, processes business logic, accesses the database, and returns JSON responses.

---

# Step 3: Add Project to Solution

## Command

```bash
dotnet sln add Aarogyam.API/Aarogyam.API.csproj
```

## What does this do?

Registers the Web API project inside the Solution.

Project structure becomes:

```text
Aarogyam.sln
│
└── Aarogyam.API
```

## Why is this required?

Without adding the project, the solution does not know that the project exists.

---

# Step 4: Install Required NuGet Packages

## Entity Framework Core SQL Server

```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
```

### Purpose

Installs Entity Framework Core SQL Server provider.

Allows EF Core to communicate with SQL Server.

Without this package:

```csharp
options.UseSqlServer(...)
```

will not work.

---

## Swagger

```bash
dotnet add package Swashbuckle.AspNetCore
```

### Purpose

Installs Swagger/OpenAPI support.

Swagger automatically generates API documentation and provides a UI to test APIs.

Available at:

```text
http://localhost:5000/swagger
```

---

## MailKit

```bash
dotnet add package MailKit
```

### Purpose

Installs MailKit, an SMTP email client library.

Used to send the OTP verification code by email after a patient or doctor registers. Pulls in `MimeKit` (message building) and `BouncyCastle.Cryptography` (TLS) as dependencies automatically.

Configured via the `Email` section in `appsettings.json` (SMTP host, port, sender email/password) and consumed through `IEmailService` / `EmailService`.

---

## BCrypt.Net-Next

```bash
dotnet add package BCrypt.Net-Next
```

### Purpose

Installs BCrypt.Net-Next, a password hashing library.

Used to hash a password before it is stored and to verify a login attempt against the stored hash, so plain-text passwords are never saved in the database.

---

## JWT Bearer Authentication

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

### Purpose

Installs the JWT (JSON Web Token) authentication handler for ASP.NET Core.

Used to issue a signed token when login succeeds, and to validate that token on later requests, so protected endpoints can use `[Authorize]` without needing sessions or cookies.

Configured via the `Jwt` section in `appsettings.json` (issuer, audience, secret key, expiry) and consumed through `ITokenService` / `TokenService`.

---

# Step 5: Verify Installation

## Restore Packages

```bash
dotnet restore
```

Downloads all packages listed in the `.csproj` file.

---

## Run the Project

```bash
dotnet run
```

If successful, the output will be similar to:

```text
Now listening on:
http://localhost:5000
```

Open:

```text
http://localhost:5000/swagger
```

Swagger UI should load successfully.

---

# Packages Installed

| Package | Purpose |
|----------|----------|
| Microsoft.EntityFrameworkCore.SqlServer | Connects EF Core with SQL Server |
| Swashbuckle.AspNetCore | Generates Swagger API documentation |
| MailKit | Sends OTP verification emails over SMTP |
| BCrypt.Net-Next | Hashes and verifies user passwords |
| Microsoft.AspNetCore.Authentication.JwtBearer | Issues and validates JWT login tokens |

---

# Project Created

```text
Aarogyam.sln
│
└── Aarogyam.API
    │
    ├── Program.cs
    ├── appsettings.json
    ├── appsettings.Development.json
    ├── Controllers
    ├── Properties
    └── Aarogyam.API.csproj
```

---

# Summary

1. Created a Solution (`Aarogyam.sln`) to organize the application.
2. Created an ASP.NET Core Web API project (`Aarogyam.API`).
3. Added the project to the solution.
4. Installed Entity Framework Core SQL Server package for database connectivity.
5. Installed Swagger for API documentation and testing.
6. Installed MailKit for sending OTP verification emails.
7. Installed BCrypt.Net-Next for password hashing.
8. Installed JWT Bearer authentication for issuing and validating login tokens.
9. Restored packages and verified the project by running the application.

## Digital Health Identity

Aarogyam is a Digital Health Identity platform that provides every patient with a unique Aarogyam ID for maintaining lifelong medical records in a secure and centralized system.

The platform allows patients to manage their health records digitally while enabling doctors to access medical history, create diagnoses, generate prescriptions, and maintain a complete patient health timeline.

---

## Problem Statement

Medical records are often scattered across multiple hospitals, clinics, laboratories, and physical documents.

Common challenges include:

* Lost medical reports
* Repeated diagnostic tests
* Incomplete patient history
* Difficulty accessing previous prescriptions
* Lack of centralized health information

Aarogyam solves this problem by creating a single digital health identity for every patient.

---

## Key Features

### Patient

* Secure Registration & Login
* OTP Verification
* Unique Aarogyam ID Generation
* Medical Report Upload
* Medical History Timeline
* Prescription Management
* QR Code Based Identification
* Download Health Records

### Doctor

* Doctor Registration & Approval Workflow
* Patient Search
* View Medical History
* Add Diagnoses
* Create Digital Prescriptions
* Upload Medical Reports
* Generate Prescription PDF

### Admin

* Doctor Approval Management
* User Management
* Activity Monitoring
* Platform Statistics

---

## User Roles

### Patient

Patients can:

* View Profile
* Access Medical History
* Upload Reports
* View Prescriptions
* Download Records

### Doctor

Doctors can:

* Access Patient Records
* Add Diagnoses
* Create Prescriptions
* Manage Medical Information

### Admin

Administrators can:

* Approve Doctors
* Manage Users
* Monitor Platform Activity

---

## Technology Stack

### Frontend

* React
* React Router
* Axios

### Backend

* ASP.NET Core Web API
* Entity Framework Core
* JWT Authentication

### Database

* SQL Server

### Additional Services

* OTP Verification
* QR Code Generation
* PDF Generation
* Email Notifications

---

## Database Modules

* Users
* Patients
* Doctors
* Visits
* Diagnoses
* Prescriptions
* PrescriptionItems
* MedicalReports
* Notifications
* AuditLogs (Optional)

---

## Future Enhancements

* AI Medical Summary
* OCR for Printed Reports
* Mobile Application
* ABDM / ABHA Integration
* Health Analytics Dashboard
* Smart Medical Insights

---

## Project Goal

The goal of Aarogyam is to create a centralized digital health identity system that improves accessibility, continuity, and management of medical records while providing a scalable foundation for future healthcare innovations.

---

## License

This project is developed for educational and research purposes.
