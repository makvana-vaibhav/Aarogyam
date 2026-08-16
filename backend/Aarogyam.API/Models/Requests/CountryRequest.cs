using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class CountryRequest
{
    [Required(ErrorMessage = "Please enter the country name.")]
    [MaxLength(100, ErrorMessage = "Country name must be 100 characters or fewer.")]
    public string CountryName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please enter the country code.")]
    [MaxLength(10, ErrorMessage = "Country code must be 10 characters or fewer.")]
    public string CountryCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please specify whether the country is active.")]
    public bool IsActive { get; set; }
}
