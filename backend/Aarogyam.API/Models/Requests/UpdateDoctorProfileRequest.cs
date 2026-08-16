using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class UpdateDoctorProfileRequest
{
    [Required(ErrorMessage = "Please enter your first name.")]
    [MaxLength(50, ErrorMessage = "First name must be 50 characters or fewer.")]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(50, ErrorMessage = "Middle name must be 50 characters or fewer.")]
    public string? MiddleName { get; set; }

    [Required(ErrorMessage = "Please enter your last name.")]
    [MaxLength(50, ErrorMessage = "Last name must be 50 characters or fewer.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please select your hospital.")]
    public int HospitalId { get; set; }

    [Required(ErrorMessage = "Please select your specialization.")]
    public int SpecializationId { get; set; }

    [Required(ErrorMessage = "Please enter your address.")]
    [MaxLength(200, ErrorMessage = "Address must be 200 characters or fewer.")]
    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please select your country.")]
    public int CountryId { get; set; }

    [Required(ErrorMessage = "Please select your state.")]
    public int StateId { get; set; }

    [Required(ErrorMessage = "Please select your city.")]
    public int CityId { get; set; }
}
