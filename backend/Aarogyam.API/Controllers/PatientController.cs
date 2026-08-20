using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Aarogyam.API.Helpers;
using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Aarogyam.API.Repositories;
using Aarogyam.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aarogyam.API.Controllers;

[ApiController]
[Authorize(Roles = "Patient")]
[Route("api/patient")]
public class PatientController : ControllerBase
{
    private readonly IPatientRepository _patientRepository;
    private readonly IFileStorageService _fileStorage;
    private readonly IPdfService _pdfService;
    private readonly IAuditLogRepository _auditLogRepository;

    private static readonly string[] AllowedProfilePictureExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
    private const long MaxProfilePictureSizeBytes = 3 * 1024 * 1024;

    public PatientController(IPatientRepository patientRepository, IFileStorageService fileStorage, IPdfService pdfService, IAuditLogRepository auditLogRepository)
    {
        _patientRepository = patientRepository;
        _fileStorage = fileStorage;
        _pdfService = pdfService;
        _auditLogRepository = auditLogRepository;
    }

    // ================= Dashboard =================

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        return Ok(await _patientRepository.GetDashboardStatsAsync(patient.PatientId));
    }

    // ================= Profile =================

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var patient = await GetCurrentPatientAsync();
        return patient is null ? PatientNotFound() : Ok(patient);
    }

    [HttpGet("profile/pdf")]
    public async Task<IActionResult> GetProfilePdf()
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        var visits = await _patientRepository.GetVisitsAsync(patient.PatientId);
        var diagnoses = await _patientRepository.GetDiagnosesAsync(patient.PatientId, null);
        var prescriptions = await _patientRepository.GetPrescriptionsAsync(patient.PatientId);
        var reports = await _patientRepository.GetReportsAsync(patient.PatientId);

        var pdfBytes = _pdfService.GeneratePatientProfilePdf(patient, visits, diagnoses, prescriptions, reports);
        return File(pdfBytes, "application/pdf", $"aarogyam-health-record-{patient.AarogyamId}.pdf");
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdatePatientProfileRequest request)
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        var result = await _patientRepository.UpdateProfileAsync(patient.PatientId, request);
        if (result?.Success == 1)
        {
            await _auditLogRepository.LogAsync(GetCurrentUserId(), "UPDATE_PROFILE", "Patients", patient.PatientId);
            return Ok(result);
        }
        if (result is not null) result.Message = DbErrorMessageMapper.Friendly(result.Message);
        return BadRequest(result);
    }

    [HttpGet("profile/picture")]
    public async Task<IActionResult> GetProfilePicture()
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        if (string.IsNullOrEmpty(patient.ProfilePicturePath))
        {
            return NotFound(new { success = 0, message = "No profile picture set." });
        }

        var file = await _fileStorage.ReadAsync(patient.ProfilePicturePath);
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
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

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

        var result = await _patientRepository.UpdateProfilePictureAsync(patient.PatientId, relativePath);
        if (result?.Success != 1)
        {
            _fileStorage.Delete(relativePath);
            if (result is not null) result.Message = DbErrorMessageMapper.Friendly(result.Message);
            return BadRequest(result);
        }

        await _auditLogRepository.LogAsync(GetCurrentUserId(), "UPDATE_PROFILE_PICTURE", "Patients", patient.PatientId);
        return Ok(new { success = 1, message = "Profile picture updated.", profilePicturePath = relativePath });
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _patientRepository.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
        if (result?.Success == 1)
        {
            await _auditLogRepository.LogAsync(userId, "CHANGE_PASSWORD", "Users", userId);
            return Ok(result);
        }
        if (result is not null) result.Message = DbErrorMessageMapper.Friendly(result.Message);
        return BadRequest(result);
    }

    // ================= Medical History =================

    [HttpGet("visits")]
    public async Task<IActionResult> GetVisits()
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        return Ok(await _patientRepository.GetVisitsAsync(patient.PatientId));
    }

    [HttpGet("diagnoses")]
    public async Task<IActionResult> GetDiagnoses([FromQuery] int? diagnosisTypeId)
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        return Ok(await _patientRepository.GetDiagnosesAsync(patient.PatientId, diagnosisTypeId));
    }

    // ================= Reports =================

    [HttpGet("reports")]
    public async Task<IActionResult> GetReports()
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        return Ok(await _patientRepository.GetReportsAsync(patient.PatientId));
    }

    [HttpPost("reports")]
    [RequestSizeLimit(25 * 1024 * 1024)]
    public async Task<IActionResult> UploadReport([FromForm] UploadReportRequest request)
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        if (request.File.Length == 0)
        {
            return BadRequest(new { success = 0, message = "File is empty." });
        }

        var extension = Path.GetExtension(request.File.FileName);
        var storedFileName = $"{Guid.NewGuid()}{extension}";

        string relativePath;
        await using (var stream = request.File.OpenReadStream())
        {
            relativePath = await _fileStorage.SaveAsync($"reports/{patient.PatientId}", storedFileName, stream);
        }

        var result = await _patientRepository.UploadReportAsync(
            patient.PatientId,
            GetCurrentUserId(),
            request.Title,
            request.ReportType,
            relativePath,
            (int)request.File.Length,
            request.ReportDate,
            request.VisitId);

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

    [HttpDelete("reports/{id:int}")]
    public async Task<IActionResult> DeleteReport(int id)
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        var report = await _patientRepository.GetReportByIdAsync(id);
        if (report is null || report.PatientId != patient.PatientId)
        {
            return NotFound(new { success = 0, message = "Report not found." });
        }

        var result = await _patientRepository.DeleteReportAsync(id);
        if (result?.Success == 1)
        {
            _fileStorage.Delete(report.FilePath);
            await _auditLogRepository.LogAsync(GetCurrentUserId(), "DELETE_REPORT", "MedicalReports", id);
            return Ok(result);
        }

        if (result is not null) result.Message = DbErrorMessageMapper.Friendly(result.Message);
        return BadRequest(result);
    }

    [HttpGet("reports/{id:int}/download")]
    public async Task<IActionResult> DownloadReport(int id)
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        var report = await _patientRepository.GetReportByIdAsync(id);
        if (report is null || report.PatientId != patient.PatientId)
        {
            return NotFound(new { success = 0, message = "Report not found." });
        }

        var file = await _fileStorage.ReadAsync(report.FilePath);
        if (file is null)
        {
            return NotFound(new { success = 0, message = "File not found on disk." });
        }

        return File(file.Value.Content, file.Value.ContentType, file.Value.FileName);
    }

    // ================= Prescriptions =================

    [HttpGet("prescriptions")]
    public async Task<IActionResult> GetPrescriptions()
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        return Ok(await _patientRepository.GetPrescriptionsAsync(patient.PatientId));
    }

    [HttpGet("prescriptions/{id:int}")]
    public async Task<IActionResult> GetPrescriptionById(int id)
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        var prescription = await _patientRepository.GetPrescriptionDetailsAsync(id);
        if (prescription is null || prescription.PatientId != patient.PatientId)
        {
            return NotFound(new { success = 0, message = "Prescription not found." });
        }

        return Ok(prescription);
    }

    [HttpGet("prescriptions/{id:int}/download")]
    public async Task<IActionResult> DownloadPrescription(int id)
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        var prescription = await _patientRepository.GetPrescriptionDetailsAsync(id);
        if (prescription is null || prescription.PatientId != patient.PatientId)
        {
            return NotFound(new { success = 0, message = "Prescription not found." });
        }

        var pdfPath = await _patientRepository.GetOrGeneratePrescriptionPdfPathAsync(id);
        if (pdfPath is null)
        {
            return NotFound(new { success = 0, message = "Unable to generate prescription PDF." });
        }

        var file = await _fileStorage.ReadAsync(pdfPath);
        if (file is null)
        {
            return NotFound(new { success = 0, message = "File not found on disk." });
        }

        return File(file.Value.Content, file.Value.ContentType, file.Value.FileName);
    }

    // ================= QR Health Card =================

    [HttpGet("health-card")]
    public async Task<IActionResult> GetHealthCard()
    {
        var patient = await GetCurrentPatientAsync();
        return patient is null ? PatientNotFound() : Ok(patient);
    }

    [HttpGet("health-card/qr")]
    public async Task<IActionResult> GetHealthCardQr()
    {
        var patient = await GetCurrentPatientAsync();
        if (patient is null) return PatientNotFound();

        var qrPath = await _patientRepository.GetOrGenerateQrCodePathAsync(patient.PatientId);
        if (qrPath is null)
        {
            return NotFound(new { success = 0, message = "Unable to generate QR code." });
        }

        var file = await _fileStorage.ReadAsync(qrPath);
        if (file is null)
        {
            return NotFound(new { success = 0, message = "File not found on disk." });
        }

        return File(file.Value.Content, file.Value.ContentType, file.Value.FileName);
    }

    // ================= Notifications =================

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications([FromQuery] bool unreadOnly = false)
    {
        return Ok(await _patientRepository.GetNotificationsAsync(GetCurrentUserId(), unreadOnly));
    }

    [HttpPut("notifications/{id:int}/read")]
    public async Task<IActionResult> MarkNotificationRead(int id)
    {
        var result = await _patientRepository.MarkNotificationReadAsync(id, GetCurrentUserId());
        if (result is null) return NotFound(new { success = 0, message = "Notification not found." });
        if (result.Success == 1) return Ok(result);
        result.Message = DbErrorMessageMapper.Friendly(result.Message);
        return BadRequest(result);
    }

    // ================= Helpers =================

    private int GetCurrentUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return int.Parse(sub!);
    }

    private Task<PatientMasterRow?> GetCurrentPatientAsync()
    {
        return _patientRepository.GetProfileByUserIdAsync(GetCurrentUserId());
    }

    private NotFoundObjectResult PatientNotFound() =>
        NotFound(new { success = 0, message = "Patient profile not found for this account." });
}
