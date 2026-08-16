using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class HospitalRequest
{
    [Required(ErrorMessage = "Please enter the hospital name.")]
    [MaxLength(150, ErrorMessage = "Hospital name must be 150 characters or fewer.")]
    public string HospitalName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please enter the hospital address.")]
    [MaxLength(200, ErrorMessage = "Address must be 200 characters or fewer.")]
    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please select a city.")]
    public int CityId { get; set; }

    [MaxLength(20, ErrorMessage = "Phone number must be 20 characters or fewer.")]
    public string? PhoneNumber { get; set; }

    [MaxLength(100, ErrorMessage = "Email address must be 100 characters or fewer.")]
    public string? Email { get; set; }

    [Required(ErrorMessage = "Please specify whether the hospital is active.")]
    public bool IsActive { get; set; }
}
