using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class CreateDiagnosisRequest
{
    [Required(ErrorMessage = "Please select a visit.")]
    public int VisitId { get; set; }

    [Required(ErrorMessage = "Please select a diagnosis type.")]
    public int DiagnosisTypeId { get; set; }

    [Required(ErrorMessage = "Please enter a diagnosis title.")]
    [MaxLength(200, ErrorMessage = "Diagnosis title must be 200 characters or fewer.")]
    public string DiagnosisTitle { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required(ErrorMessage = "Please select the diagnosis date.")]
    public DateTime DiagnosisDate { get; set; }
}
