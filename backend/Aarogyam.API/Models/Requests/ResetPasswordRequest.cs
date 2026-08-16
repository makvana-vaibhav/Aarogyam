using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class ResetPasswordRequest
{
    [Required(ErrorMessage = "We couldn't identify your account. Please restart the password reset process.")]
    public int UserId { get; set; }

    [Required(ErrorMessage = "Please enter the OTP code sent to your email.")]
    public string OtpCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please enter a new password.")]
    [MinLength(6, ErrorMessage = "New password must be at least 6 characters.")]
    public string NewPassword { get; set; } = string.Empty;
}
