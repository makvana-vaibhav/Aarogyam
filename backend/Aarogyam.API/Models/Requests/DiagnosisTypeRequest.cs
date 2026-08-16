using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class DiagnosisTypeRequest
{
    [Required(ErrorMessage = "Please enter the diagnosis type name.")]
    [MaxLength(100, ErrorMessage = "Diagnosis type name must be 100 characters or fewer.")]
    public string DiagnosisTypeName { get; set; } = string.Empty;

    [MaxLength(200, ErrorMessage = "Description must be 200 characters or fewer.")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Please specify whether the diagnosis type is active.")]
    public bool IsActive { get; set; }
}
