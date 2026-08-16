using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class VerifyOtpRequest
{
    [Required(ErrorMessage = "We couldn't identify your account. Please restart the verification process.")]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Please enter the OTP code sent to your email.")]
    [MaxLength(10, ErrorMessage = "OTP code must be 10 characters or fewer.")]
    public string OtpCode { get; set; } = string.Empty;
}
