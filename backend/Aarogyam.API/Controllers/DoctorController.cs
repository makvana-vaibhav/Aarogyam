using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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

    public DoctorController(IDoctorRepository doctorRepository, IFileStorageService fileStorage, IAuditLogRepository auditLogRepository)
    {
        _doctorRepository = doctorRepository;
        _fileStorage = fileStorage;
        _auditLogRepository = auditLogRepository;
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
        return BadRequest(result);
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
        return result.Success == 1 ? Ok(result) : BadRequest(result);
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
        return result.Success == 1 ? Ok(result) : BadRequest(result);
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
        return result.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPost("reports")]
    [RequestSizeLimit(25 * 1024 * 1024)]
    public async Task<IActionResult> UploadReport([FromForm] DoctorUploadReportRequest request)
    {
        var doctor = await GetCurrentDoctorAsync();
        if (doctor is null) return NotFound(new { success = 0, message = "Doctor profile not found." });
        if (request.File.Length == 0) return BadRequest(new { success = 0, message = "File is empty." });

        var extension = Path.GetExtension(request.File.FileName);
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
        return result.Success == 1 ? Ok(result) : BadRequest(result);
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);
    }

    private Task<Models.Responses.DoctorMasterRow?> GetCurrentDoctorAsync()
    {
        return _doctorRepository.GetProfileByUserIdAsync(GetCurrentUserId());
    }
}
