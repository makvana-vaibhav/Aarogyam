using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class RegisterDoctorRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(200)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string MiddleName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LicenseNumber { get; set; } = string.Empty;

    [Required]
    public int HospitalId { get; set; }

    [Required]
    public int DegreeId { get; set; }

    [Required]
    public int SpecializationId { get; set; }

    [Required]
    [MaxLength(200)]
    public string LicenseDocumentPath { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string DegreeDocumentPath { get; set; } = string.Empty;

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