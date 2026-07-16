using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string PasswordHash { get; set; } = string.Empty;
}