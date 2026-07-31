using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class UpdateDoctorProfileRequest
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
    public int HospitalId { get; set; }

    [Required]
    public int SpecializationId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [Required]
    public int CountryId { get; set; }

    [Required]
    public int StateId { get; set; }

    [Required]
    public int CityId { get; set; }
}
