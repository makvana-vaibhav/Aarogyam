namespace Aarogyam.API.Models.Responses;

public class PrescriptionDetailsRow
{
    public int PrescriptionId { get; set; }

    public int VisitId { get; set; }

    public int? DiagnosisId { get; set; }

    public string PrescriptionText { get; set; } = string.Empty;

    public string? PdfPath { get; set; }

    public DateTime PrescriptionDate { get; set; }

    public int PatientId { get; set; }

    public string PatientName { get; set; } = string.Empty;

    public string DoctorName { get; set; } = string.Empty;

    public string DiagnosisTitle { get; set; } = string.Empty;
}
