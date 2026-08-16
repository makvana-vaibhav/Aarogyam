using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class RegisterDoctorRequest
{
    [Required(ErrorMessage = "Please enter your email address.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    [MaxLength(100, ErrorMessage = "Email address must be 100 characters or fewer.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please enter your phone number.")]
    [MaxLength(20, ErrorMessage = "Phone number must be 20 characters or fewer.")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please enter a password.")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    [MaxLength(200, ErrorMessage = "Password is too long. Please use 200 characters or fewer.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please enter your first name.")]
    [MaxLength(50, ErrorMessage = "First name must be 50 characters or fewer.")]
    public string FirstName { get; set; } = string.Empty;

    [MaxLength(50, ErrorMessage = "Middle name must be 50 characters or fewer.")]
    public string? MiddleName { get; set; }

    [Required(ErrorMessage = "Please enter your last name.")]
    [MaxLength(50, ErrorMessage = "Last name must be 50 characters or fewer.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please enter your medical license number.")]
    [MaxLength(50, ErrorMessage = "License number must be 50 characters or fewer.")]
    public string LicenseNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please select your hospital.")]
    public int HospitalId { get; set; }

    [Required(ErrorMessage = "Please select your degree.")]
    public int DegreeId { get; set; }

    [Required(ErrorMessage = "Please select your specialization.")]
    public int SpecializationId { get; set; }

    [Required(ErrorMessage = "Please upload your medical license document.")]
    [MaxLength(200, ErrorMessage = "License document path must be 200 characters or fewer.")]
    public string LicenseDocumentPath { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please upload your degree document.")]
    [MaxLength(200, ErrorMessage = "Degree document path must be 200 characters or fewer.")]
    public string DegreeDocumentPath { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please enter your address.")]
    [MaxLength(200, ErrorMessage = "Address must be 200 characters or fewer.")]
    public string Address { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please select your country.")]
    public int CountryId { get; set; }

    [Required(ErrorMessage = "Please select your state.")]
    public int StateId { get; set; }

    [Required(ErrorMessage = "Please select your city.")]
    public int CityId { get; set; }

    [MaxLength(200, ErrorMessage = "Profile picture path must be 200 characters or fewer.")]
    public string? ProfilePicturePath { get; set; }
}
