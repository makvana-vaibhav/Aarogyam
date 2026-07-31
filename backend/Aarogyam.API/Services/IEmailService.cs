namespace Aarogyam.API.Services;

public interface IEmailService
{
    Task SendOtpEmailAsync(
        string toEmail,
        string otpCode,
        string subject = "Your Aarogyam verification code",
        string title = "Reset your password",
        string subtitle = "Use the verification code below to set a new password.",
        string name = "");
}
