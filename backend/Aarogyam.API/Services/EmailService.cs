using Aarogyam.API.Configuration;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Aarogyam.API.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> options, ILogger<EmailService> logger)
    {
        _settings = options.Value;
        _logger = logger;
    }

    public async Task SendOtpEmailAsync(
        string toEmail,
        string otpCode,
        string subject = "Your Aarogyam verification code",
        string title = "Reset your password",
        string subtitle = "Use the verification code below to set a new password.",
        string name = "")
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html")
        {
            Text = GetEmailHtml(otpCode, title, subtitle, name, toEmail)
        };

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_settings.SenderEmail, _settings.SenderPassword);
            await client.SendAsync(message);
            _logger.LogInformation("OTP email sent successfully to {Email}", toEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending OTP email to {Email}", toEmail);
            throw;
        }
        finally
        {
            if (client.IsConnected)
            {
                await client.DisconnectAsync(true);
            }
        }
    }

    private static string GetEmailHtml(string otpCode, string title, string subtitle, string name, string email)
    {
        var year = DateTime.UtcNow.Year;

        // Resolve greeting name
        var greetingName = !string.IsNullOrWhiteSpace(name) ? name.Trim() : "";
        if (string.IsNullOrEmpty(greetingName) && !string.IsNullOrEmpty(email))
        {
            var parts = email.Split('@');
            if (parts.Length > 0 && !string.IsNullOrEmpty(parts[0]))
            {
                var rawName = parts[0].Replace(".", " ").Replace("_", " ");
                greetingName = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(rawName);
            }
        }
        var greetingText = !string.IsNullOrEmpty(greetingName) ? $"Hello {greetingName}," : "Hello,";

        return $@"<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>{title}</title>
</head>
<body style='margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.5;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color: #f4f5f7; padding: 32px 16px;'>
    <tr>
      <td align='center'>
        <table width='100%' cellpadding='0' cellspacing='0' border='0' style='max-width: 480px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;'>
          <!-- Header -->
          <tr>
            <td style='padding: 24px 28px 16px; border-bottom: 1px solid #f3f4f6;'>
              <table cellpadding='0' cellspacing='0' border='0'>
                <tr>
                  <td style='font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.3px;'>
                    Aarogyam
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style='padding: 24px 28px;'>
              <h2 style='margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;'>
                {title}
              </h2>
              <p style='margin: 0 0 12px; font-size: 14px; color: #374151;'>
                {greetingText}
              </p>
              <p style='margin: 0 0 20px; font-size: 14px; color: #4b5563;'>
                {subtitle}
              </p>
              
              <!-- OTP Box -->
              <div style='margin: 20px 0; padding: 18px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; text-align: center;'>
                <div style='font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;'>
                  Verification Code
                </div>
                <div style='font-family: monospace, Courier; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: 8px;'>
                  {otpCode}
                </div>
              </div>
              
              <p style='margin: 0 0 8px; font-size: 13px; color: #6b7280;'>
                This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style='margin: 0; font-size: 13px; color: #9ca3af;'>
                If you did not request this verification code, please ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style='padding: 16px 28px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af;'>
              © {year} Aarogyam • Digital Health Platform
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
    }
}
