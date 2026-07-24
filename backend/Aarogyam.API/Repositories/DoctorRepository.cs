using Aarogyam.API.Data;
using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Repositories;

public class DoctorRepository : IDoctorRepository
{
    private readonly AarogyamDbContext _context;

    public DoctorRepository(AarogyamDbContext context)
    {
        _context = context;
    }

    public async Task<DoctorMasterRow?> GetProfileByUserIdAsync(int userId)
    {
        var rows = await _context.DoctorMasterRows
            .FromSqlRaw("EXEC dbo.spDoctorsGet @DoctorId, @UserId, @ApprovalStatus",
                new SqlParameter("@DoctorId", DBNull.Value),
                new SqlParameter("@UserId", userId),
                new SqlParameter("@ApprovalStatus", DBNull.Value))
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<DoctorDashboardStatsResult?> GetDashboardStatsAsync(int doctorId)
    {
        var rows = await _context.DoctorDashboardStatsResults
            .FromSqlRaw("EXEC dbo.spDoctorDashboardStats @DoctorId", new SqlParameter("@DoctorId", doctorId))
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public Task<List<DoctorPatientRow>> GetMyPatientsAsync(int doctorId, string? search)
    {
        return _context.DoctorPatientRows
            .FromSqlRaw("EXEC dbo.spDoctorPatientsGet @DoctorId, @Search",
                new SqlParameter("@DoctorId", doctorId),
                new SqlParameter("@Search", (object?)search ?? DBNull.Value))
            .ToListAsync();
    }

    public Task<List<PatientMasterRow>> SearchPatientsAsync(string? aarogyamId, string? searchName)
    {
        return _context.PatientMasterRows
            .FromSqlRaw("EXEC dbo.spPatientsGet @PatientId, @UserId, @AarogyamId, @SearchName",
                new SqlParameter("@PatientId", DBNull.Value),
                new SqlParameter("@UserId", DBNull.Value),
                new SqlParameter("@AarogyamId", (object?)aarogyamId ?? DBNull.Value),
                new SqlParameter("@SearchName", (object?)searchName ?? DBNull.Value))
            .ToListAsync();
    }

    public async Task<PatientMasterRow?> GetPatientByIdAsync(int patientId)
    {
        var rows = await _context.PatientMasterRows
            .FromSqlRaw("EXEC dbo.spPatientsGet @PatientId, @UserId, @AarogyamId, @SearchName",
                new SqlParameter("@PatientId", patientId),
                new SqlParameter("@UserId", DBNull.Value),
                new SqlParameter("@AarogyamId", DBNull.Value),
                new SqlParameter("@SearchName", DBNull.Value))
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public Task<List<VisitRow>> GetPatientVisitsAsync(int patientId)
    {
        return _context.VisitRows
            .FromSqlRaw("EXEC dbo.spVisitsGet @VisitId, @PatientId, @DoctorId",
                new SqlParameter("@VisitId", DBNull.Value),
                new SqlParameter("@PatientId", patientId),
                new SqlParameter("@DoctorId", DBNull.Value))
            .ToListAsync();
    }

    public async Task<VisitRow?> GetVisitByIdAsync(int visitId)
    {
        var rows = await _context.VisitRows
            .FromSqlRaw("EXEC dbo.spVisitsGet @VisitId, @PatientId, @DoctorId",
                new SqlParameter("@VisitId", visitId),
                new SqlParameter("@PatientId", DBNull.Value),
                new SqlParameter("@DoctorId", DBNull.Value))
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public Task<List<DiagnosisRow>> GetPatientDiagnosesAsync(int patientId, int? diagnosisTypeId)
    {
        return _context.DiagnosisRows
            .FromSqlRaw("EXEC dbo.spDiagnosesGet @DiagnosisId, @VisitId, @PatientId, @DiagnosisTypeId",
                new SqlParameter("@DiagnosisId", DBNull.Value),
                new SqlParameter("@VisitId", DBNull.Value),
                new SqlParameter("@PatientId", patientId),
                new SqlParameter("@DiagnosisTypeId", (object?)diagnosisTypeId ?? DBNull.Value))
            .ToListAsync();
    }

    public Task<List<MedicalReportRow>> GetPatientReportsAsync(int patientId)
    {
        return _context.MedicalReportRows
            .FromSqlRaw("EXEC dbo.spMedicalReportsGet @ReportId, @PatientId, @VisitId",
                new SqlParameter("@ReportId", DBNull.Value),
                new SqlParameter("@PatientId", patientId),
                new SqlParameter("@VisitId", DBNull.Value))
            .ToListAsync();
    }

    public Task<List<PrescriptionRow>> GetPatientPrescriptionsAsync(int patientId)
    {
        return _context.PrescriptionRows
            .FromSqlRaw("EXEC dbo.spPrescriptionsGet @PrescriptionId, @VisitId, @PatientId",
                new SqlParameter("@PrescriptionId", DBNull.Value),
                new SqlParameter("@VisitId", DBNull.Value),
                new SqlParameter("@PatientId", patientId))
            .ToListAsync();
    }

    public async Task<MedicalReportRow?> GetReportByIdAsync(int reportId)
    {
        var rows = await _context.MedicalReportRows
            .FromSqlRaw("EXEC dbo.spMedicalReportsGet @ReportId, @PatientId, @VisitId",
                new SqlParameter("@ReportId", reportId),
                new SqlParameter("@PatientId", DBNull.Value),
                new SqlParameter("@VisitId", DBNull.Value))
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<List<NotificationRow>> GetNotificationsAsync(int userId, bool unreadOnly)
    {
        var rows = await _context.NotificationRows
            .FromSqlRaw("EXEC dbo.spNotificationsGet @NotificationId, @UserId",
                new SqlParameter("@NotificationId", DBNull.Value),
                new SqlParameter("@UserId", userId))
            .ToListAsync();

        return unreadOnly ? rows.Where(n => !n.IsRead).ToList() : rows;
    }

    public async Task<SimpleResult?> MarkNotificationReadAsync(int notificationId, int userId)
    {
        var rows = await _context.SimpleResults
            .FromSqlRaw("EXEC dbo.spNotificationsMarkRead @NotificationId, @UserId",
                new SqlParameter("@NotificationId", notificationId),
                new SqlParameter("@UserId", userId))
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<VisitManageResult?> CreateVisitAsync(int doctorId, CreateVisitRequest request)
    {
        var rows = await _context.VisitManageResults
            .FromSqlRaw(
                "EXEC dbo.spVisitsManage @Action, @VisitId, @PatientId, @DoctorId, @VisitDate, @Notes",
                new SqlParameter("@Action", "INSERT"),
                new SqlParameter("@VisitId", DBNull.Value),
                new SqlParameter("@PatientId", request.PatientId),
                new SqlParameter("@DoctorId", doctorId),
                new SqlParameter("@VisitDate", request.VisitDate),
                new SqlParameter("@Notes", (object?)request.Notes ?? DBNull.Value))
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<DiagnosisManageResult?> CreateDiagnosisAsync(int doctorId, CreateDiagnosisRequest request)
    {
        var visit = await GetVisitByIdAsync(request.VisitId);
        if (visit is null || visit.DoctorId != doctorId)
        {
            return new DiagnosisManageResult { Success = 0, Message = "Visit not found." };
        }

        var rows = await _context.DiagnosisManageResults
            .FromSqlRaw(
                "EXEC dbo.spDiagnosesManage @Action, @DiagnosisId, @VisitId, @DiagnosisTypeId, @DiagnosisTitle, @Description, @DiagnosisDate",
                new SqlParameter("@Action", "INSERT"),
                new SqlParameter("@DiagnosisId", DBNull.Value),
                new SqlParameter("@VisitId", request.VisitId),
                new SqlParameter("@DiagnosisTypeId", request.DiagnosisTypeId),
                new SqlParameter("@DiagnosisTitle", request.DiagnosisTitle),
                new SqlParameter("@Description", (object?)request.Description ?? DBNull.Value),
                new SqlParameter("@DiagnosisDate", request.DiagnosisDate))
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<PrescriptionManageResult?> CreatePrescriptionAsync(int doctorId, CreatePrescriptionRequest request)
    {
        var visit = await GetVisitByIdAsync(request.VisitId);
        if (visit is null || visit.DoctorId != doctorId)
        {
            return new PrescriptionManageResult { Success = 0, Message = "Visit not found." };
        }

        var rows = await _context.PrescriptionManageResults
            .FromSqlRaw(
                "EXEC dbo.spCreatePrescription @VisitId, @DiagnosisId, @PrescriptionText, @PdfPath, @PrescriptionDate",
                new SqlParameter("@VisitId", request.VisitId),
                new SqlParameter("@DiagnosisId", (object?)request.DiagnosisId ?? DBNull.Value),
                new SqlParameter("@PrescriptionText", request.PrescriptionText),
                new SqlParameter("@PdfPath", DBNull.Value),
                new SqlParameter("@PrescriptionDate", request.PrescriptionDate))
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<MedicalReportManageResult?> UploadReportAsync(int doctorId, int uploadedByUserId, DoctorUploadReportRequest request, string filePath, int fileSize)
    {
        var rows = await _context.MedicalReportManageResults
            .FromSqlRaw(
                "EXEC dbo.spUploadMedicalReport @PatientId, @DoctorId, @UploadedByUserId, @Title, @ReportType, @FilePath, @FileSize, @ReportDate, @VisitId, @DiagnosisId",
                new SqlParameter("@PatientId", request.PatientId),
                new SqlParameter("@DoctorId", doctorId),
                new SqlParameter("@UploadedByUserId", uploadedByUserId),
                new SqlParameter("@Title", request.Title),
                new SqlParameter("@ReportType", request.ReportType),
                new SqlParameter("@FilePath", filePath),
                new SqlParameter("@FileSize", fileSize),
                new SqlParameter("@ReportDate", (object?)request.ReportDate ?? DBNull.Value),
                new SqlParameter("@VisitId", (object?)request.VisitId ?? DBNull.Value),
                new SqlParameter("@DiagnosisId", (object?)request.DiagnosisId ?? DBNull.Value))
            .ToListAsync();
        return rows.FirstOrDefault();
    }
}
