using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class VerifyForgotOtpRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    public string OtpCode { get; set; } = string.Empty;
}
