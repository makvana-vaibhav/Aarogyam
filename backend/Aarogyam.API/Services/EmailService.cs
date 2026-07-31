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
<body style='margin:0; padding:0; background-color:#081c15; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:#081c15; padding: 40px 16px;'>
    <tr>
      <td align='center'>
        <!-- Main Card Container -->
        <table width='600' cellpadding='0' cellspacing='0' border='0' style='width:100%; max-width:600px; background-color:#0d2818; border:1px solid #2d6a4f; border-radius:16px; overflow:hidden; box-shadow:0 16px 40px rgba(0,0,0,0.5);'>
          
          <!-- Brand Header Banner -->
          <tr>
            <td style='padding: 32px 36px; background-color: #113824; border-bottom: 1px solid #2d6a4f; text-align: left;'>
              <table width='100%' cellpadding='0' cellspacing='0' border='0'>
                <tr>
                  <td style='vertical-align: middle;'>
                    <div style='display:inline-block; vertical-align:middle; width:36px; height:36px; background-color:#1b4332; border:1px solid #40916c; border-radius:10px; text-align:center; line-height:36px;'>
                      <svg width='22' height='22' viewBox='0 0 32 32' fill='none' style='vertical-align:middle;'>
                        <rect x='1.5' y='1.5' width='29' height='29' rx='8.5' stroke='#40916c' stroke-width='2'/>
                        <path d='M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3' stroke='#74c69d' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>
                      </svg>
                    </div>
                    <span style='font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: #ffffff; margin-left: 12px; vertical-align: middle; letter-spacing: 0.3px;'>
                      Aarogyam
                    </span>
                  </td>
                  <td align='right' style='vertical-align: middle;'>
                    <span style='display:inline-block; font-family: monospace; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #74c69d; background-color: rgba(64, 145, 108, 0.2); border: 1px solid #40916c; padding: 5px 10px; border-radius: 20px;'>
                      Health Identity
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style='padding: 40px 36px 32px;'>
              <h1 style='margin:0 0 12px; font-family: Georgia, serif; font-size: 24px; font-weight: 600; color: #ffffff;'>
                {title}
              </h1>
              <p style='margin:0 0 28px; font-size: 15px; line-height: 1.6; color: #b7e4c7;'>
                {subtitle}
              </p>

              <!-- OTP Code Display Card -->
              <div style='margin: 0 0 32px; background-color: #05140e; border: 2px solid #52b788; border-radius: 12px; padding: 28px 20px; text-align: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);'>
                <div style='font-family: monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #52b788; margin-bottom: 10px;'>
                  Your One-Time Verification Code
                </div>
                <div style='font-family: ""JetBrains Mono"", Consolas, ""Courier New"", monospace; font-size: 38px; font-weight: 700; color: #74c69d; letter-spacing: 12px; text-indent: 12px;'>
                  {otpCode}
                </div>
              </div>

              <!-- Security Information Note -->
              <div style='background-color: rgba(45, 106, 79, 0.25); border-left: 3px solid #52b788; border-radius: 6px; padding: 14px 18px; margin-bottom: 28px;'>
                <p style='margin:0; font-size: 13.5px; line-height: 1.5; color: #d8f3dc;'>
                  <strong>⏱ Valid for 10 minutes.</strong> For security reasons, please do not share this code with anyone. Aarogyam staff will never ask for your OTP.
                </p>
              </div>

              <p style='margin:0; font-size: 13px; line-height: 1.6; color: #74c69d;'>
                If you did not request this email, you can safely ignore it. Your account security remains intact.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style='padding: 24px 36px; background-color: #081c15; border-top: 1px solid #2d6a4f; text-align: center;'>
              <p style='margin: 0 0 6px; font-size: 12.5px; color: #95d5b2;'>
                © {year} <strong>Aarogyam Health Identity System</strong>
              </p>
              <p style='margin: 0; font-family: monospace; font-size: 11px; color: #52b788; letter-spacing: 1px;'>
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
