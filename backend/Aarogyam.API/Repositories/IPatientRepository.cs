using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;

namespace Aarogyam.API.Repositories;

public interface IPatientRepository
{
    Task<PatientMasterRow?> GetProfileByUserIdAsync(int userId);
    Task<PatientMasterRow?> GetProfileByIdAsync(int patientId);
    Task<SimpleResult?> UpdateProfileAsync(int patientId, UpdatePatientProfileRequest request);
    Task<SimpleResult?> ChangePasswordAsync(int userId, string currentPassword, string newPassword);
    Task<string?> GetOrGenerateQrCodePathAsync(int patientId);

    Task<PatientDashboardStatsResult?> GetDashboardStatsAsync(int patientId);

    Task<List<VisitRow>> GetVisitsAsync(int patientId);

    Task<List<DiagnosisRow>> GetDiagnosesAsync(int patientId, int? diagnosisTypeId);

    Task<List<MedicalReportRow>> GetReportsAsync(int patientId);
    Task<MedicalReportRow?> GetReportByIdAsync(int reportId);
    Task<MedicalReportManageResult?> UploadReportAsync(
        int patientId, int uploadedByUserId, string title, string reportType,
        string filePath, int fileSize, DateTime? reportDate, int? visitId);
    Task<MedicalReportManageResult?> DeleteReportAsync(int reportId);

    Task<List<PrescriptionRow>> GetPrescriptionsAsync(int patientId);
    Task<PrescriptionDetailsRow?> GetPrescriptionDetailsAsync(int prescriptionId);
    Task<string?> GetOrGeneratePrescriptionPdfPathAsync(int prescriptionId);

    Task<List<NotificationRow>> GetNotificationsAsync(int userId, bool unreadOnly);
    Task<SimpleResult?> MarkNotificationReadAsync(int notificationId, int userId);
}
