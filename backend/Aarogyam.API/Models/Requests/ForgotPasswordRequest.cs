using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
