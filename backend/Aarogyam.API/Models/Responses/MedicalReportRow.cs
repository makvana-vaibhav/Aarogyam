namespace Aarogyam.API.Models.Responses;

public class MedicalReportRow
{
    public int ReportId { get; set; }

    public int? VisitId { get; set; }

    public int? DiagnosisId { get; set; }

    public int PatientId { get; set; }

    public int? DoctorId { get; set; }

    public int UploadedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string ReportType { get; set; } = string.Empty;

    public string FilePath { get; set; } = string.Empty;

    public int? FileSize { get; set; }

    public DateTime? ReportDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
