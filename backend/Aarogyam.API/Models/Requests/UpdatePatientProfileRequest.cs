using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class UpdatePatientProfileRequest
{
    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? MiddleName { get; set; }

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfBirth { get; set; }

    [Required]
    [MaxLength(10)]
    public string Gender { get; set; } = string.Empty;

    [MaxLength(5)]
    public string? BloodGroup { get; set; }

    [Required]
    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [Required]
    public int CountryId { get; set; }

    [Required]
    public int StateId { get; set; }

    [Required]
    public int CityId { get; set; }

    [MaxLength(20)]
    public string? EmergencyContact { get; set; }
}
