using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class ResendOtpRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;
}