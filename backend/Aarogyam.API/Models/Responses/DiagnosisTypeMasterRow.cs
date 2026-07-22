namespace Aarogyam.API.Models.Responses;

public class DiagnosisTypeMasterRow
{
    public int DiagnosisTypeId { get; set; }

    public string DiagnosisTypeName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
