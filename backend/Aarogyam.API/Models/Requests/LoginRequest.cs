using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;//email address of the user trying to log in because it cant be null so defaulting to empty string

    [Required]
    [MaxLength(200)]
    public string Password { get; set; } = string.Empty;
}