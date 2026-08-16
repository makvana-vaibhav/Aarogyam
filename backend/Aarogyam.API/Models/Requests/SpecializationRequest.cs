using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class SpecializationRequest
{
    [Required(ErrorMessage = "Please enter the specialization name.")]
    [MaxLength(100, ErrorMessage = "Specialization name must be 100 characters or fewer.")]
    public string SpecializationName { get; set; } = string.Empty;

    [MaxLength(200, ErrorMessage = "Description must be 200 characters or fewer.")]
    public string? Description { get; set; }
}
