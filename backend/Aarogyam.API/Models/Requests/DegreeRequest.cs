using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class DegreeRequest
{
    [Required]
    [MaxLength(100)]
    public string DegreeName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string ShortName { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Description { get; set; }
}
