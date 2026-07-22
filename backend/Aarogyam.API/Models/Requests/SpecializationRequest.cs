using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class SpecializationRequest
{
    [Required]
    [MaxLength(100)]
    public string SpecializationName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Description { get; set; }
}
