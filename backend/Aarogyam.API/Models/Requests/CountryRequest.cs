using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class CountryRequest
{
    [Required]
    [MaxLength(100)]
    public string CountryName { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    public string CountryCode { get; set; } = string.Empty;

    [Required]
    public bool IsActive { get; set; }
}
