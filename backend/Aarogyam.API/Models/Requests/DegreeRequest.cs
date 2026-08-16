using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class DegreeRequest
{
    [Required(ErrorMessage = "Please enter the degree name.")]
    [MaxLength(100, ErrorMessage = "Degree name must be 100 characters or fewer.")]
    public string DegreeName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please enter a short name for the degree.")]
    [MaxLength(20, ErrorMessage = "Short name must be 20 characters or fewer.")]
    public string ShortName { get; set; } = string.Empty;

    [MaxLength(200, ErrorMessage = "Description must be 200 characters or fewer.")]
    public string? Description { get; set; }
}
