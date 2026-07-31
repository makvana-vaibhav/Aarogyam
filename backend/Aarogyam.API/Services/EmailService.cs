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
        string title = "Verify your email address",
        string subtitle = "Use the verification code below to complete your email verification.")
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html")
        {
            Text = GetEmailHtml(otpCode, title, subtitle)
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

    private static string GetEmailHtml(string otpCode, string title, string subtitle)
    {
        var year = DateTime.UtcNow.Year;
        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>{title}</title>
</head>
<body style='margin:0; padding:0; background-color:#faf5ec; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:#faf5ec; padding: 36px 16px;'>
    <tr>
      <td align='center'>
        <!-- Main Compact Card Container -->
        <table width='520' cellpadding='0' cellspacing='0' border='0' style='width:100%; max-width:520px; background-color:#fffbf3; border:1px solid #e5dace; border-radius:14px; overflow:hidden; box-shadow:0 12px 32px -16px rgba(27, 67, 50, 0.12);'>
          
          <!-- Brand Header Banner (Sand Raised & Pine Dark Accent) -->
          <tr>
            <td style='padding: 24px 28px; background-color: #f1e8d8; border-bottom: 1px solid #e0d3c1; text-align: left;'>
              <table width='100%' cellpadding='0' cellspacing='0' border='0'>
                <tr>
                  <td style='vertical-align: middle;'>
                    <div style='display:inline-block; vertical-align:middle; width:34px; height:34px; background-color:#1b4332; border-radius:8px; text-align:center; line-height:34px;'>
                      <svg width='20' height='20' viewBox='0 0 32 32' fill='none' style='vertical-align:middle;'>
                        <rect x='1.5' y='1.5' width='29' height='29' rx='8.5' stroke='#40916c' stroke-width='2'/>
                        <path d='M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3' stroke='#ffffff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>
                      </svg>
                    </div>
                    <span style='font-family: Georgia, serif; font-size: 20px; font-weight: 600; color: #1b4332; margin-left: 10px; vertical-align: middle; letter-spacing: 0.2px;'>
                      Aarogyam
                    </span>
                  </td>
                  <td align='right' style='vertical-align: middle;'>
                    <span style='display:inline-block; font-family: monospace; font-size: 9.5px; letter-spacing: 1.2px; text-transform: uppercase; color: #2d6a4f; background-color: rgba(45, 106, 79, 0.08); border: 1px solid rgba(45, 106, 79, 0.25); padding: 4px 9px; border-radius: 16px; font-weight: 600;'>
                      Health Identity
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style='padding: 32px 28px 24px;'>
              <h1 style='margin:0 0 10px; font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: #1b4332;'>
                {title}
              </h1>
              <p style='margin:0 0 24px; font-size: 14.5px; line-height: 1.55; color: #4c6759;'>
                {subtitle}
              </p>

              <!-- OTP Code Display Card -->
              <div style='margin: 0 0 26px; background-color: #f1e8d8; border: 2px solid #2d6a4f; border-radius: 12px; padding: 22px 16px; text-align: center;'>
                <div style='font-family: monospace; font-size: 11px; letter-spacing: 1.8px; text-transform: uppercase; color: #2d6a4f; margin-bottom: 8px; font-weight: 600;'>
                  Your Verification Code
                </div>
                <div style='font-family: ""JetBrains Mono"", Consolas, ""Courier New"", monospace; font-size: 34px; font-weight: 700; color: #1b4332; letter-spacing: 10px; text-indent: 10px;'>
                  {otpCode}
                </div>
              </div>

              <!-- Security Note Callout -->
              <div style='background-color: #eaf4ef; border-left: 3px solid #2d6a4f; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px;'>
                <p style='margin:0; font-size: 13px; line-height: 1.5; color: #16301f;'>
                  <strong>⏱ Valid for 10 minutes.</strong> Never share this OTP with anyone for your account security.
                </p>
              </div>

              <p style='margin:0; font-size: 12.5px; line-height: 1.5; color: #829a8b;'>
                If you did not request this email, no action is required. Your account remains safe.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style='padding: 20px 28px; background-color: #faf5ec; border-top: 1px solid #e5dace; text-align: center;'>
              <p style='margin: 0 0 4px; font-size: 12px; color: #4c6759;'>
                © {year} <strong>Aarogyam Health Identity System</strong>
              </p>
              <p style='margin: 0; font-family: monospace; font-size: 11px; color: #2d6a4f; letter-spacing: 1px;'>
                आरोग्यम् — “Good Health”
              </p>
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
