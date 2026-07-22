using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class DiagnosisTypeRequest
{
    [Required]
    [MaxLength(100)]
    public string DiagnosisTypeName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Description { get; set; }

    [Required]
    public bool IsActive { get; set; }
}
