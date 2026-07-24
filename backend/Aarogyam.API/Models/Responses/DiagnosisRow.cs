namespace Aarogyam.API.Models.Responses;

public class DiagnosisRow
{
    public int DiagnosisId { get; set; }

    public int VisitId { get; set; }

    public int DiagnosisTypeId { get; set; }

    public string DiagnosisTitle { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime DiagnosisDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
