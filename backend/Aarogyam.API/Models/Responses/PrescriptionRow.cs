namespace Aarogyam.API.Models.Responses;

public class PrescriptionRow
{
    public int PrescriptionId { get; set; }

    public int VisitId { get; set; }

    public int? DiagnosisId { get; set; }

    public string PrescriptionText { get; set; } = string.Empty;

    public string? PdfPath { get; set; }

    public DateTime PrescriptionDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
