using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;

namespace Aarogyam.API.Repositories;

public interface IDoctorRepository
{
    Task<DoctorMasterRow?> GetProfileByUserIdAsync(int userId);
    Task<DoctorDashboardStatsResult?> GetDashboardStatsAsync(int doctorId);
    Task<List<DoctorPatientRow>> GetMyPatientsAsync(int doctorId, string? search);
    Task<List<PatientMasterRow>> SearchPatientsAsync(string? aarogyamId, string? searchName);
    Task<PatientMasterRow?> GetPatientByIdAsync(int patientId);
    Task<List<VisitRow>> GetPatientVisitsAsync(int patientId);
    Task<VisitRow?> GetVisitByIdAsync(int visitId);
    Task<List<DiagnosisRow>> GetPatientDiagnosesAsync(int patientId, int? diagnosisTypeId);
    Task<List<MedicalReportRow>> GetPatientReportsAsync(int patientId);
    Task<List<PrescriptionRow>> GetPatientPrescriptionsAsync(int patientId);
    Task<MedicalReportRow?> GetReportByIdAsync(int reportId);
    Task<List<NotificationRow>> GetNotificationsAsync(int userId, bool unreadOnly);
    Task<SimpleResult?> MarkNotificationReadAsync(int notificationId, int userId);
    Task<VisitManageResult?> CreateVisitAsync(int doctorId, CreateVisitRequest request);
    Task<DiagnosisManageResult?> CreateDiagnosisAsync(int doctorId, CreateDiagnosisRequest request);
    Task<PrescriptionManageResult?> CreatePrescriptionAsync(int doctorId, CreatePrescriptionRequest request);
    Task<MedicalReportManageResult?> UploadReportAsync(int doctorId, int uploadedByUserId, DoctorUploadReportRequest request, string filePath, int fileSize);
}
