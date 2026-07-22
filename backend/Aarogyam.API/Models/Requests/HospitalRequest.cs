using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class HospitalRequest
{
    [Required]
    [MaxLength(150)]
    public string HospitalName { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [Required]
    public int CityId { get; set; }

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [MaxLength(100)]
    public string? Email { get; set; }

    [Required]
    public bool IsActive { get; set; }
}
