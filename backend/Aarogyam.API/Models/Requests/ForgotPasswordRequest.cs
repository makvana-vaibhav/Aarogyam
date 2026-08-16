using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class ForgotPasswordRequest
{
    [Required(ErrorMessage = "Please enter your email address.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    public string Email { get; set; } = string.Empty;
}
