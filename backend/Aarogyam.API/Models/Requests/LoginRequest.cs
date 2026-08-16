using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class LoginRequest
{
    [Required(ErrorMessage = "Please enter your email address.")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
    [MaxLength(100, ErrorMessage = "Email address must be 100 characters or fewer.")]
    public string Email { get; set; } = string.Empty;//email address of the user trying to log in because it cant be null so defaulting to empty string

    [Required(ErrorMessage = "Please enter your password.")]
    [MaxLength(200, ErrorMessage = "Password is too long.")]
    public string Password { get; set; } = string.Empty;
}
