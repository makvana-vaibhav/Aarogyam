using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class CreateDiagnosisRequest
{
    [Required]
    public int VisitId { get; set; }

    [Required]
    public int DiagnosisTypeId { get; set; }

    [Required]
    [MaxLength(200)]
    public string DiagnosisTitle { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public DateTime DiagnosisDate { get; set; }
}
