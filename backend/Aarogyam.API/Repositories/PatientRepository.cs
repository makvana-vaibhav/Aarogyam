using Aarogyam.API.Data;
using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Aarogyam.API.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Repositories;

public class PatientRepository : IPatientRepository
{
    private readonly AarogyamDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly IQrCodeService _qrCodeService;
    private readonly IPdfService _pdfService;

    public PatientRepository(
        AarogyamDbContext context,
        IFileStorageService fileStorage,
        IQrCodeService qrCodeService,
        IPdfService pdfService)
    {
        _context = context;
        _fileStorage = fileStorage;
        _qrCodeService = qrCodeService;
        _pdfService = pdfService;
    }

    public async Task<PatientMasterRow?> GetProfileByUserIdAsync(int userId)
    {
        var parameters = new[]
        {
            new SqlParameter("@PatientId", DBNull.Value),
            new SqlParameter("@UserId", userId),
            new SqlParameter("@AarogyamId", DBNull.Value),
            new SqlParameter("@SearchName", DBNull.Value)
        };

        var rows = await _context.PatientMasterRows
            .FromSqlRaw("EXEC dbo.spPatientsGet @PatientId, @UserId, @AarogyamId, @SearchName", parameters)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<PatientMasterRow?> GetProfileByIdAsync(int patientId)
    {
        var parameters = new[]
        {
            new SqlParameter("@PatientId", patientId),
            new SqlParameter("@UserId", DBNull.Value),
            new SqlParameter("@AarogyamId", DBNull.Value),
            new SqlParameter("@SearchName", DBNull.Value)
        };

        var rows = await _context.PatientMasterRows
            .FromSqlRaw("EXEC dbo.spPatientsGet @PatientId, @UserId, @AarogyamId, @SearchName", parameters)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<SimpleResult?> UpdateProfileAsync(int patientId, UpdatePatientProfileRequest request)
    {
        // UserId and AarogyamId are untouched by the SP itself, so no fetch-first
        // needed for them. ProfilePicturePath IS touched by the SP's UPDATE
        // statement though (it always sets the column), so to avoid silently
        // wiping out an existing profile picture on every unrelated profile edit,
        // fetch the current value here and pass it straight through unchanged.
        var current = await GetProfileByIdAsync(patientId);

        var parameters = new[]
        {
            new SqlParameter("@PatientId", patientId),
            new SqlParameter("@FirstName", request.FirstName),
            new SqlParameter("@MiddleName", (object?)request.MiddleName ?? DBNull.Value),
            new SqlParameter("@LastName", request.LastName),
            new SqlParameter("@DateOfBirth", request.DateOfBirth),
            new SqlParameter("@Gender", request.Gender),
            new SqlParameter("@BloodGroup", (object?)request.BloodGroup ?? DBNull.Value),
            new SqlParameter("@Address", request.Address),
            new SqlParameter("@CountryId", request.CountryId),
            new SqlParameter("@StateId", request.StateId),
            new SqlParameter("@CityId", request.CityId),
            new SqlParameter("@EmergencyContact", (object?)request.EmergencyContact ?? DBNull.Value),
            new SqlParameter("@ProfilePicturePath", (object?)current?.ProfilePicturePath ?? DBNull.Value)
        };

        var results = await _context.SimpleResults
            .FromSqlRaw(
                "EXEC dbo.spPatientsUpdateProfile @PatientId, @FirstName, @MiddleName, @LastName, @DateOfBirth, @Gender, @BloodGroup, @Address, @CountryId, @StateId, @CityId, @EmergencyContact, @ProfilePicturePath",
                parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<SimpleResult?> UpdateProfilePictureAsync(int patientId, string profilePicturePath)
    {
        // spPatientsUpdateProfile requires all editable fields (no partial-update
        // support), so fetch the patient's current values and resend them
        // unchanged alongside the new profile picture path.
        var current = await GetProfileByIdAsync(patientId);
        if (current is null)
        {
            return new SimpleResult { Success = 0, Message = "Patient not found." };
        }

        var parameters = new[]
        {
            new SqlParameter("@PatientId", patientId),
            new SqlParameter("@FirstName", current.FirstName),
            new SqlParameter("@MiddleName", (object?)current.MiddleName ?? DBNull.Value),
            new SqlParameter("@LastName", current.LastName),
            new SqlParameter("@DateOfBirth", current.DateOfBirth),
            new SqlParameter("@Gender", current.Gender),
            new SqlParameter("@BloodGroup", (object?)current.BloodGroup ?? DBNull.Value),
            new SqlParameter("@Address", current.Address),
            new SqlParameter("@CountryId", current.CountryId),
            new SqlParameter("@StateId", current.StateId),
            new SqlParameter("@CityId", current.CityId),
            new SqlParameter("@EmergencyContact", (object?)current.EmergencyContact ?? DBNull.Value),
            new SqlParameter("@ProfilePicturePath", profilePicturePath)
        };

        var results = await _context.SimpleResults
            .FromSqlRaw(
                "EXEC dbo.spPatientsUpdateProfile @PatientId, @FirstName, @MiddleName, @LastName, @DateOfBirth, @Gender, @BloodGroup, @Address, @CountryId, @StateId, @CityId, @EmergencyContact, @ProfilePicturePath",
                parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<SimpleResult?> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
    {
        var userParameters = new[]
        {
            new SqlParameter("@UserId", userId),
            new SqlParameter("@Email", DBNull.Value)
        };

        var users = await _context.UserMasterRows
            .FromSqlRaw("EXEC dbo.spUsersGet @UserId, @Email", userParameters)
            .ToListAsync();
        var user = users.FirstOrDefault();

        if (user is null)
        {
            return new SimpleResult { Success = 0, Message = "User not found." };
        }

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
        {
            return new SimpleResult { Success = 0, Message = "Current password is incorrect." };
        }

        if (BCrypt.Net.BCrypt.Verify(newPassword, user.PasswordHash))
        {
            return new SimpleResult { Success = 0, Message = "New password must be different from your current password." };
        }

        var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

        var parameters = new[]
        {
            new SqlParameter("@UserId", userId),
            new SqlParameter("@PasswordHash", newHash)
        };

        var results = await _context.SimpleResults
            .FromSqlRaw("EXEC dbo.spUsersSetPassword @UserId, @PasswordHash", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<string?> GetOrGenerateQrCodePathAsync(int patientId)
    {
        var patient = await GetProfileByIdAsync(patientId);
        if (patient is null) return null;

        if (!string.IsNullOrEmpty(patient.QrCodePath) && File.Exists(_fileStorage.ResolvePath(patient.QrCodePath)))
        {
            return patient.QrCodePath;
        }

        var qrContent = $"https://aarogyam.vaibhavmakvana.in/doctor/create-visit?aarogyamId={patient.AarogyamId}";
        var qrBytes = _qrCodeService.GenerateQrPng(qrContent);

        using var stream = new MemoryStream(qrBytes);
        var relativePath = await _fileStorage.SaveAsync("qrcodes", $"{patientId}.png", stream);

        var parameters = new[]
        {
            new SqlParameter("@PatientId", patientId),
            new SqlParameter("@QrCodePath", relativePath)
        };

        await _context.SimpleResults
            .FromSqlRaw("EXEC dbo.spPatientsSetQrCode @PatientId, @QrCodePath", parameters)
            .ToListAsync();

        return relativePath;
    }

    public async Task<PatientDashboardStatsResult?> GetDashboardStatsAsync(int patientId)
    {
        var parameters = new[] { new SqlParameter("@PatientId", patientId) };
        var results = await _context.PatientDashboardStatsResults
            .FromSqlRaw("EXEC dbo.spPatientDashboardStats @PatientId", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public Task<List<VisitRow>> GetVisitsAsync(int patientId)
    {
        var parameters = new[]
        {
            new SqlParameter("@VisitId", DBNull.Value),
            new SqlParameter("@PatientId", patientId),
            new SqlParameter("@DoctorId", DBNull.Value)
        };

        return _context.VisitRows
            .FromSqlRaw("EXEC dbo.spVisitsGet @VisitId, @PatientId, @DoctorId", parameters)
            .ToListAsync();
    }

    public Task<List<DiagnosisRow>> GetDiagnosesAsync(int patientId, int? diagnosisTypeId)
    {
        var parameters = new[]
        {
            new SqlParameter("@DiagnosisId", DBNull.Value),
            new SqlParameter("@VisitId", DBNull.Value),
            new SqlParameter("@PatientId", patientId),
            new SqlParameter("@DiagnosisTypeId", (object?)diagnosisTypeId ?? DBNull.Value)
        };

        return _context.DiagnosisRows
            .FromSqlRaw("EXEC dbo.spDiagnosesGet @DiagnosisId, @VisitId, @PatientId, @DiagnosisTypeId", parameters)
            .ToListAsync();
    }

    public Task<List<MedicalReportRow>> GetReportsAsync(int patientId)
    {
        var parameters = new[]
        {
            new SqlParameter("@ReportId", DBNull.Value),
            new SqlParameter("@PatientId", patientId),
            new SqlParameter("@VisitId", DBNull.Value)
        };

        return _context.MedicalReportRows
            .FromSqlRaw("EXEC dbo.spMedicalReportsGet @ReportId, @PatientId, @VisitId", parameters)
            .ToListAsync();
    }

    public async Task<MedicalReportRow?> GetReportByIdAsync(int reportId)
    {
        var parameters = new[]
        {
            new SqlParameter("@ReportId", reportId),
            new SqlParameter("@PatientId", DBNull.Value),
            new SqlParameter("@VisitId", DBNull.Value)
        };

        var rows = await _context.MedicalReportRows
            .FromSqlRaw("EXEC dbo.spMedicalReportsGet @ReportId, @PatientId, @VisitId", parameters)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<MedicalReportManageResult?> UploadReportAsync(
        int patientId, int uploadedByUserId, string title, string reportType,
        string filePath, int fileSize, DateTime? reportDate, int? visitId)
    {
        var parameters = new[]
        {
            new SqlParameter("@PatientId", patientId),
            new SqlParameter("@DoctorId", DBNull.Value),
            new SqlParameter("@UploadedByUserId", uploadedByUserId),
            new SqlParameter("@Title", title),
            new SqlParameter("@ReportType", reportType),
            new SqlParameter("@FilePath", filePath),
            new SqlParameter("@FileSize", fileSize),
            new SqlParameter("@ReportDate", (object?)reportDate ?? DBNull.Value),
            new SqlParameter("@VisitId", (object?)visitId ?? DBNull.Value),
            new SqlParameter("@DiagnosisId", DBNull.Value)
        };

        var results = await _context.MedicalReportManageResults
            .FromSqlRaw(
                "EXEC dbo.spUploadMedicalReport @PatientId, @DoctorId, @UploadedByUserId, @Title, @ReportType, @FilePath, @FileSize, @ReportDate, @VisitId, @DiagnosisId",
                parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<MedicalReportManageResult?> DeleteReportAsync(int reportId)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "DELETE"),
            new SqlParameter("@ReportId", reportId),
            new SqlParameter("@VisitId", DBNull.Value),
            new SqlParameter("@DiagnosisId", DBNull.Value),
            new SqlParameter("@PatientId", DBNull.Value),
            new SqlParameter("@DoctorId", DBNull.Value),
            new SqlParameter("@UploadedByUserId", DBNull.Value),
            new SqlParameter("@Title", DBNull.Value),
            new SqlParameter("@ReportType", DBNull.Value),
            new SqlParameter("@FilePath", DBNull.Value),
            new SqlParameter("@FileSize", DBNull.Value),
            new SqlParameter("@ReportDate", DBNull.Value)
        };

        var results = await _context.MedicalReportManageResults
            .FromSqlRaw(
                "EXEC dbo.spMedicalReportsManage @Action, @ReportId, @VisitId, @DiagnosisId, @PatientId, @DoctorId, @UploadedByUserId, @Title, @ReportType, @FilePath, @FileSize, @ReportDate",
                parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public Task<List<PrescriptionRow>> GetPrescriptionsAsync(int patientId)
    {
        var parameters = new[]
        {
            new SqlParameter("@PrescriptionId", DBNull.Value),
            new SqlParameter("@VisitId", DBNull.Value),
            new SqlParameter("@PatientId", patientId)
        };

        return _context.PrescriptionRows
            .FromSqlRaw("EXEC dbo.spPrescriptionsGet @PrescriptionId, @VisitId, @PatientId", parameters)
            .ToListAsync();
    }

    public async Task<PrescriptionDetailsRow?> GetPrescriptionDetailsAsync(int prescriptionId)
    {
        var parameters = new[] { new SqlParameter("@PrescriptionId", prescriptionId) };
        var rows = await _context.PrescriptionDetailsRows
            .FromSqlRaw("EXEC dbo.spPrescriptionDetailsGet @PrescriptionId", parameters)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<string?> GetOrGeneratePrescriptionPdfPathAsync(int prescriptionId)
    {
        var details = await GetPrescriptionDetailsAsync(prescriptionId);
        if (details is null) return null;

        if (!string.IsNullOrEmpty(details.PdfPath) && File.Exists(_fileStorage.ResolvePath(details.PdfPath)))
        {
            return details.PdfPath;
        }

        var pdfBytes = _pdfService.GeneratePrescriptionPdf(details);

        using var stream = new MemoryStream(pdfBytes);
        var relativePath = await _fileStorage.SaveAsync("prescriptions", $"{prescriptionId}.pdf", stream);

        var parameters = new[]
        {
            new SqlParameter("@PrescriptionId", prescriptionId),
            new SqlParameter("@PdfPath", relativePath)
        };

        await _context.SimpleResults
            .FromSqlRaw("EXEC dbo.spPrescriptionsSetPdfPath @PrescriptionId, @PdfPath", parameters)
            .ToListAsync();

        return relativePath;
    }

    public async Task<List<NotificationRow>> GetNotificationsAsync(int userId, bool unreadOnly)
    {
        var parameters = new[]
        {
            new SqlParameter("@NotificationId", DBNull.Value),
            new SqlParameter("@UserId", userId)
        };

        var rows = await _context.NotificationRows
            .FromSqlRaw("EXEC dbo.spNotificationsGet @NotificationId, @UserId", parameters)
            .ToListAsync();

        return unreadOnly ? rows.Where(n => !n.IsRead).ToList() : rows;
    }

    public async Task<SimpleResult?> MarkNotificationReadAsync(int notificationId, int userId)
    {
        // Ownership check and update happen together in the SP (WHERE NotificationId AND UserId),
        // so there is no need to fetch the row first just to check who it belongs to.
        var parameters = new[]
        {
            new SqlParameter("@NotificationId", notificationId),
            new SqlParameter("@UserId", userId)
        };

        var results = await _context.SimpleResults
            .FromSqlRaw("EXEC dbo.spNotificationsMarkRead @NotificationId, @UserId", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }
}
