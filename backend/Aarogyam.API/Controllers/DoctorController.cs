using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Aarogyam.API.Helpers;
using Aarogyam.API.Models.Requests;
using Aarogyam.API.Repositories;
using Aarogyam.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aarogyam.API.Controllers;

[ApiController]
[Authorize(Roles = "Doctor")]
[Route("api/doctor")]
public class DoctorController : ControllerBase
{
    private readonly IDoctorRepository _doctorRepository;
    private readonly IFileStorageService _fileStorage;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IEmailService _emailService;

    private static readonly string[] AllowedProfilePictureExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
    private const long MaxProfilePictureSizeBytes = 3 * 1024 * 1024;

    private static readonly string[] AllowedReportExtensions = { ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx" };
    private const long MaxReportSizeBytes = 20 * 1024 * 1024;

    public DoctorController(
        IDoctorRepository doctorRepository,
        IFileStorageService fileStorage,
        IAuditLogRepository auditLogRepository,
        INotificationRepository notificationRepository,
        IEmailService emailService)
    {
        _doctorRepository = doctorRepository;
        _fileStorage = fileStorage;
        _auditLogRepository = auditLogRepository;
        _notificationRepository = notificationRepository;
        _emailService = emailService;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var doctor = await GetCurrentDoctorAsync();
        return doctor is null ? NotFound(new { success = 0, message = "Doctor profile not found." }) : Ok(doctor);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateDoctorProfileRequest request)
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });

        var result = await _doctorRepository.UpdateProfileAsync(doctor.DoctorId, request);
        if (result?.Success == 1)
        {
            await _auditLogRepository.LogAsync(GetCurrentUserId(), "UPDATE_PROFILE", "Doctors", doctor.DoctorId);
            return Ok(result);
        }
        if (result is not null) result.Message = DbErrorMessageMapper.Friendly(result.Message);
        return BadRequest(result);
    }

    [HttpGet("profile/picture")]
    public async Task<IActionResult> GetProfilePicture()
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });

        if (string.IsNullOrEmpty(doctor.ProfilePicturePath))
        {
            return NotFound(new { success = 0, message = "No profile picture set." });
        }

        var file = await _fileStorage.ReadAsync(doctor.ProfilePicturePath);
        if (file is null)
        {
            return NotFound(new { success = 0, message = "File not found on disk." });
        }

        return File(file.Value.Content, file.Value.ContentType, file.Value.FileName);
    }

    [HttpPatch("profile/picture")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateProfilePicture([FromForm] FileUploadRequest request)
    {
        var file = request.File;
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });

        if (file is null || file.Length == 0)
        {
            return BadRequest(new { success = 0, message = "Please choose a photo to upload." });
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedProfilePictureExtensions.Contains(extension))
        {
            return BadRequest(new { success = 0, message = "Please upload a JPG, PNG, or WEBP image." });
        }

        if (file.Length > MaxProfilePictureSizeBytes)
        {
            return BadRequest(new { success = 0, message = "Profile picture must be smaller than 3MB." });
        }

        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        string relativePath;
        await using (var stream = file.OpenReadStream())
        {
            relativePath = await _fileStorage.SaveAsync("profile-pictures", storedFileName, stream);
        }

        var result = await _doctorRepository.UpdateProfilePictureAsync(doctor.DoctorId, relativePath);
        if (result?.Success != 1)
        {
            _fileStorage.Delete(relativePath);
            if (result is not null) result.Message = DbErrorMessageMapper.Friendly(result.Message);
            return BadRequest(result);
        }

        await _auditLogRepository.LogAsync(GetCurrentUserId(), "UPDATE_PROFILE_PICTURE", "Doctors", doctor.DoctorId);
        return Ok(new { success = 1, message = "Profile picture updated.", profilePicturePath = relativePath });
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _doctorRepository.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
        if (result?.Success == 1)
        {
            await _auditLogRepository.LogAsync(userId, "CHANGE_PASSWORD", "Users", userId);
            return Ok(result);
        }
        if (result is not null) result.Message = DbErrorMessageMapper.Friendly(result.Message);
        return BadRequest(result);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });

        return Ok(await _doctorRepository.GetDashboardStatsAsync(doctor.DoctorId));
    }

    [HttpGet("patients")]
    public async Task<IActionResult> GetMyPatients([FromQuery] string? search)
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });

        return Ok(await _doctorRepository.GetMyPatientsAsync(doctor.DoctorId, search));
    }

    [HttpGet("patients/search")]
    public async Task<IActionResult> SearchPatients([FromQuery] string? aarogyamId, [FromQuery] string? searchName)
    {
        return Ok(await _doctorRepository.SearchPatientsAsync(aarogyamId, searchName));
    }

    [HttpGet("patients/{id:int}")]
    public async Task<IActionResult> GetPatientById(int id)
    {
        var patient = await _doctorRepository.GetPatientByIdAsync(id);
        return patient is null ? NotFound(new { success = 0, message = "Patient not found." }) : Ok(patient);
    }

    [HttpGet("patients/{id:int}/visits")]
    public Task<List<Models.Responses.VisitRow>> GetPatientVisits(int id) =>
        _doctorRepository.GetPatientVisitsAsync(id);

    [HttpGet("patients/{id:int}/diagnoses")]
    public Task<List<Models.Responses.DiagnosisRow>> GetPatientDiagnoses(int id, [FromQuery] int? diagnosisTypeId) =>
        _doctorRepository.GetPatientDiagnosesAsync(id, diagnosisTypeId);

    [HttpGet("patients/{id:int}/reports")]
    public Task<List<Models.Responses.MedicalReportRow>> GetPatientReports(int id) =>
        _doctorRepository.GetPatientReportsAsync(id);

    [HttpGet("patients/{id:int}/prescriptions")]
    public Task<List<Models.Responses.PrescriptionRow>> GetPatientPrescriptions(int id) =>
        _doctorRepository.GetPatientPrescriptionsAsync(id);

    [HttpGet("prescriptions/{id:int}")]
    public async Task<IActionResult> GetPrescriptionDetails(int id)
    {
        var details = await _doctorRepository.GetPrescriptionDetailsAsync(id);
        return details is null ? NotFound(new { success = 0, message = "Prescription not found." }) : Ok(details);
    }

    [HttpGet("prescriptions/{id:int}/download")]
    public async Task<IActionResult> DownloadPrescription(int id)
    {
        var pdfPath = await _doctorRepository.GetOrGeneratePrescriptionPdfPathAsync(id);
        if (pdfPath is null) return NotFound(new { success = 0, message = "Prescription not found." });

        var file = await _fileStorage.ReadAsync(pdfPath);
        if (file is null) return NotFound(new { success = 0, message = "File not found on disk." });

        return File(file.Value.Content, file.Value.ContentType, file.Value.FileName);
    }

    [HttpPost("visits")]
    public async Task<IActionResult> CreateVisit([FromBody] CreateVisitRequest request)
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });

        var result = await _doctorRepository.CreateVisitAsync(doctor.DoctorId, request);
        if (result is null) return BadRequest(new { success = 0, message = "Unable to create visit. Please try again." });
        if (result.Success == 1 && result.VisitId.HasValue)
        {
            await _auditLogRepository.LogAsync(GetCurrentUserId(), "CREATE_VISIT", "Visits", result.VisitId.Value);
        }
        if (result.Success == 1) return Ok(result);
        result.Message = DbErrorMessageMapper.Friendly(result.Message);
        return BadRequest(result);
    }

    // Rollback used by the frontend when a later step of the create-visit wizard (diagnosis,
    // prescription, or report upload) fails after the visit itself was already created - keeps
    // the wizard's "all or nothing" feel instead of leaving an orphaned, empty visit behind.
    // Diagnoses/prescriptions attached to this visit cascade-delete with it; if a report was
    // somehow already attached, the DB delete is rejected (FK) rather than silently losing data.
    [HttpDelete("visits/{id:int}")]
    public async Task<IActionResult> DeleteVisit(int id)
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });

        var result = await _doctorRepository.DeleteVisitAsync(doctor.DoctorId, id);
        if (result?.Success != 1)
        {
            if (result is not null) result.Message = DbErrorMessageMapper.Friendly(result.Message);
            return BadRequest(result);
        }

        await _auditLogRepository.LogAsync(GetCurrentUserId(), "DELETE_VISIT", "Visits", id);
        return Ok(result);
    }

    // Called once by the frontend after the whole create-visit submission finishes
    // (visit, plus whichever of diagnosis/prescription/report were included) so the
    // patient gets exactly ONE "new visit" notification/email per submission, not one
    // per sub-entity. If a report was uploaded as part of this visit, it's attached.
    [HttpPost("visits/{id:int}/notify")]
    public async Task<IActionResult> NotifyVisitPatient(int id)
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });

        var visit = await _doctorRepository.GetVisitByIdAsync(id);
        if (visit is null) return NotFound(new { success = 0, message = "Visit not found." });

        await NotifyPatientAsync(
            visit.PatientId,
            "New visit recorded",
            $"Dr. {FormatDoctorName(doctor)} recorded a visit for you on {visit.VisitDate:dd MMM yyyy}.",
            id);

        return Ok(new { success = 1 });
    }

    [HttpPost("diagnoses")]
    public async Task<IActionResult> CreateDiagnosis([FromBody] CreateDiagnosisRequest request)
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });

        var result = await _doctorRepository.CreateDiagnosisAsync(doctor.DoctorId, request);
        if (result is null) return BadRequest(new { success = 0, message = "Unable to create diagnosis. Please try again." });
        if (result.Success == 1 && result.DiagnosisId.HasValue)
        {
            await _auditLogRepository.LogAsync(GetCurrentUserId(), "CREATE_DIAGNOSIS", "Diagnoses", result.DiagnosisId.Value);
        }
        if (result.Success == 1) return Ok(result);
        result.Message = DbErrorMessageMapper.Friendly(result.Message);
        return BadRequest(result);
    }

    [HttpPost("prescriptions")]
    public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionRequest request)
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });

        var result = await _doctorRepository.CreatePrescriptionAsync(doctor.DoctorId, request);
        if (result is null) return BadRequest(new { success = 0, message = "Unable to create prescription. Please try again." });
        if (result.Success == 1 && result.PrescriptionId.HasValue)
        {
            await _auditLogRepository.LogAsync(GetCurrentUserId(), "CREATE_PRESCRIPTION", "Prescriptions", result.PrescriptionId.Value);
        }
        if (result.Success == 1) return Ok(result);
        result.Message = DbErrorMessageMapper.Friendly(result.Message);
        return BadRequest(result);
    }

    [HttpPost("reports")]
    [RequestSizeLimit(21 * 1024 * 1024)]
    public async Task<IActionResult> UploadReport([FromForm] DoctorUploadReportRequest request)
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });
        if (request.File.Length == 0) return BadRequest(new { success = 0, message = "File is empty." });

        var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
        if (!AllowedReportExtensions.Contains(extension))
        {
            return BadRequest(new { success = 0, message = "Please upload a PDF, JPG, PNG, DOC, or DOCX file." });
        }

        if (request.File.Length > MaxReportSizeBytes)
        {
            return BadRequest(new { success = 0, message = "Report file must be smaller than 20 MB." });
        }

        var storedFileName = $"{Guid.NewGuid()}{extension}";

        string relativePath;
        await using (var stream = request.File.OpenReadStream())
        {
            relativePath = await _fileStorage.SaveAsync($"reports/{request.PatientId}", storedFileName, stream);
        }

        var result = await _doctorRepository.UploadReportAsync(doctor.DoctorId, GetCurrentUserId(), request, relativePath, (int)request.File.Length);
        if (result?.Success != 1)
        {
            _fileStorage.Delete(relativePath);
            if (result is not null) result.Message = DbErrorMessageMapper.Friendly(result.Message);
            return BadRequest(result);
        }

        if (result.ReportId.HasValue)
        {
            await _auditLogRepository.LogAsync(GetCurrentUserId(), "UPLOAD_REPORT", "MedicalReports", result.ReportId.Value);
        }

        return Ok(result);
    }

    [HttpGet("reports/{id:int}/download")]
    public async Task<IActionResult> DownloadReport(int id)
    {
        var report = await _doctorRepository.GetReportByIdAsync(id);
        if (report is null) return NotFound(new { success = 0, message = "Report not found." });

        var file = await _fileStorage.ReadAsync(report.FilePath);
        if (file is null) return NotFound(new { success = 0, message = "File not found on disk." });

        return File(file.Value.Content, file.Value.ContentType, file.Value.FileName);
    }

    [HttpGet("notifications")]
    public Task<List<Models.Responses.NotificationRow>> GetNotifications([FromQuery] bool unreadOnly = false) =>
        _doctorRepository.GetNotificationsAsync(GetCurrentUserId(), unreadOnly);

    [HttpPut("notifications/{id:int}/read")]
    public async Task<IActionResult> MarkNotificationRead(int id)
    {
        var result = await _doctorRepository.MarkNotificationReadAsync(id, GetCurrentUserId());
        if (result is null) return NotFound(new { success = 0, message = "Notification not found." });
        if (result.Success == 1) return Ok(result);
        result.Message = DbErrorMessageMapper.Friendly(result.Message);
        return BadRequest(result);
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
    }

    private Task<Models.Responses.DoctorMasterRow?> GetCurrentDoctorAsync()
    {
        return _doctorRepository.GetProfileByUserIdAsync(GetCurrentUserId());
    }

    private static string FormatDoctorName(Models.Responses.DoctorMasterRow doctor)
    {
        var raw = string.Join(" ", new[] { doctor.FirstName, doctor.MiddleName, doctor.LastName }
            .Where(part => !string.IsNullOrWhiteSpace(part)));
        return raw.Trim();
    }

    // Creates an in-app notification and sends an email to the patient about an
    // action a doctor just took on their record. Wrapped in try/catch because
    // this must never fail or block the clinical action it follows (bad email,
    // SMTP down, patient/user lookup issues, etc.) - the visit the caller just
    // created must still succeed regardless. When visitId is supplied, any report
    // uploaded against that visit is attached to the email.
    private async Task NotifyPatientAsync(int patientId, string title, string message, int? visitId = null)
    {
        try
        {
            var patient = await _doctorRepository.GetPatientByIdAsync(patientId);
            if (patient is null) return;

            await _notificationRepository.CreateAsync(patient.UserId, title, message);

            var user = await _doctorRepository.GetUserByIdAsync(patient.UserId);
            if (user is null || string.IsNullOrWhiteSpace(user.Email)) return;

            var patientName = string.Join(" ", new[] { patient.FirstName, patient.MiddleName, patient.LastName }
                .Where(part => !string.IsNullOrWhiteSpace(part))).Trim();

            byte[]? attachmentBytes = null;
            string? attachmentFileName = null;
            string? attachmentContentType = null;
            if (visitId.HasValue)
            {
                var reports = await _doctorRepository.GetReportsByVisitIdAsync(visitId.Value);
                var report = reports.FirstOrDefault();
                if (report is not null)
                {
                    var file = await _fileStorage.ReadAsync(report.FilePath);
                    if (file is not null)
                    {
                        await using var ms = new MemoryStream();
                        await file.Value.Content.CopyToAsync(ms);
                        attachmentBytes = ms.ToArray();
                        attachmentFileName = file.Value.FileName;
                        attachmentContentType = file.Value.ContentType;
                    }
                }
            }

            await _emailService.SendNotificationEmailAsync(user.Email, patientName, title, message, attachmentBytes, attachmentFileName, attachmentContentType);
        }
        catch
        {
            // Notifications/emails are best-effort only - the visit the caller
            // just created must still succeed.
        }
    }
}
