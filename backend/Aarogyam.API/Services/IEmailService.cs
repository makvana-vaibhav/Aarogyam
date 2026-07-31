namespace Aarogyam.API.Services;

public interface IEmailService
{
    Task SendOtpEmailAsync(
        string toEmail,
        string otpCode,
        string subject = "Your Aarogyam verification code",
        string title = "Verify your email address",
        string subtitle = "Use the verification code below to complete your email verification.");
}
