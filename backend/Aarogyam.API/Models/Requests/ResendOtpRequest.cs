using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class ResendOtpRequest
{
    [Required(ErrorMessage = "Please enter your email address.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    [MaxLength(100, ErrorMessage = "Email address must be 100 characters or fewer.")]
    public string Email { get; set; } = string.Empty;
}
