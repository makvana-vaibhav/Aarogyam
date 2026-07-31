using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class ResetPasswordRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public string OtpCode { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}
