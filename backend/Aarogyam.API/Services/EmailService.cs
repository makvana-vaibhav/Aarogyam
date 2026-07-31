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

        return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
<meta charset='UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1.0'>
<title>{title}</title>
</head>
<body style='margin:0; padding:0; background-color:#f7f4ee; font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background-color:#f7f4ee; padding: 40px 16px;'>
    <tr>
      <td align='center'>
        <!-- Main Card Container matching reference screenshot -->
        <table width='520' cellpadding='0' cellspacing='0' border='0' style='width:100%; max-width:520px; background-color:#ffffff; border:1px solid #e8e2d6; border-radius:20px; overflow:hidden; box-shadow:0 12px 36px -12px rgba(11, 57, 43, 0.08); position:relative;'>
          
          <!-- Top Header Row -->
          <tr>
            <td style='padding: 28px 32px 20px; background-color: #ffffff; position: relative;'>
              <!-- Watermark Decorative Circle Background (Right Corner) -->
              <div style='position:absolute; top:-35px; right:-35px; width:150px; height:150px; border-radius:50%; background-color:#f4eee4; opacity:0.75; pointer-events:none; z-index:1;'></div>
              
              <table width='100%' cellpadding='0' cellspacing='0' border='0' style='position:relative; z-index:2;'>
                <tr>
                  <td style='vertical-align: middle;'>
                    <table cellpadding='0' cellspacing='0' border='0'>
                      <tr>
                        <td style='vertical-align: middle; padding-right: 12px;'>
                          <!-- Dark Pine Icon Box -->
                          <div style='width:42px; height:42px; background-color:#0b392b; border-radius:12px; text-align:center; line-height:42px;'>
                            <svg width='22' height='22' viewBox='0 0 32 32' fill='none' style='vertical-align:middle;'>
                              <rect x='1.5' y='1.5' width='29' height='29' rx='8.5' stroke='#2d6a4f' stroke-width='1.5'/>
                              <path d='M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3' stroke='#ffffff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>
                            </svg>
                          </div>
                        </td>
                        <td style='vertical-align: middle;'>
                          <div style='font-family: Georgia, serif; font-size: 21px; font-weight: 700; color: #0b392b; letter-spacing: -0.2px; line-height: 1.1;'>
                            Aarogyam
                          </div>
                          <div style='font-size: 12px; color: #6b7f73; margin-top: 2px; font-weight: 500;'>
                            Your Health Identity
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align='right' style='vertical-align: top;'>
                    <!-- Watermark Heartbeat Stroke Overlay SVG -->
                    <svg width='60' height='40' viewBox='0 0 60 40' fill='none' style='opacity: 0.25;'>
                      <path d='M5 20h12l5-12 7 24 5-16 5 8h16' stroke='#0b392b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
                    </svg>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style='padding: 10px 32px 28px;'>
              <!-- Title -->
              <h1 style='margin:0 0 18px; font-family: Georgia, serif; font-size: 26px; font-weight: 700; color: #0b392b; letter-spacing: -0.3px;'>
                {title}
              </h1>

              <!-- Greeting -->
              <div style='font-size: 15px; font-weight: 600; color: #1c2e24; margin-bottom: 14px;'>
                {greetingText}
              </div>

              <!-- Subtitle Description -->
              <p style='margin:0 0 8px; font-size: 14px; line-height: 1.55; color: #4f6658;'>
                We received a request to reset the password for your Aarogyam account.
              </p>
              <p style='margin:0 0 24px; font-size: 14px; line-height: 1.55; color: #4f6658;'>
                {subtitle}
              </p>

              <!-- Verification Code Display Card (Beige Container) -->
              <div style='margin: 0 0 20px; background-color: #fcf8f2; border: 1px solid #efe6d8; border-radius: 14px; padding: 22px 16px; text-align: center;'>
                <div style='font-family: monospace; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #577363; font-weight: 600; margin-bottom: 10px;'>
                  YOUR VERIFICATION CODE
                </div>
                <div style='font-family: ""JetBrains Mono"", Consolas, Georgia, monospace; font-size: 38px; font-weight: 700; color: #0b392b; letter-spacing: 14px; text-indent: 14px;'>
                  {otpCode}
                </div>
              </div>

              <!-- Code Expiry Pill -->
              <div style='background-color: #f1f7f3; border-left: 3px solid #0b392b; border-radius: 10px; padding: 12px 16px; margin-bottom: 22px;'>
                <table width='100%' cellpadding='0' cellspacing='0' border='0'>
                  <tr>
                    <td width='24' style='vertical-align: middle;'>
                      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#0b392b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
                        <circle cx='12' cy='12' r='10'/><polyline points='12 6 12 12 16 14'/>
                      </svg>
                    </td>
                    <td style='vertical-align: middle; font-size: 13.5px; color: #2c4235;'>
                      This code will expire in <strong style='color: #0b392b; font-weight: 700;'>10 minutes.</strong>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Security Notice Card -->
              <div style='background-color: #f3f8f5; border-radius: 14px; padding: 20px 22px; margin-bottom: 26px;'>
                <table cellpadding='0' cellspacing='0' border='0' style='margin-bottom: 12px;'>
                  <tr>
                    <td style='vertical-align: middle; padding-right: 10px;'>
                      <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#0b392b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>
                        <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/><path d='M9 12l2 2 4-4'/>
                      </svg>
                    </td>
                    <td style='vertical-align: middle; font-family: Georgia, serif; font-size: 16px; font-weight: 600; color: #0b392b;'>
                      Security Notice
                    </td>
                  </tr>
                </table>
                <ul style='margin:0; padding-left: 18px; font-size: 13px; line-height: 1.65; color: #3b5446;'>
                  <li style='margin-bottom: 4px;'>Never share this code with anyone.</li>
                  <li style='margin-bottom: 4px;'>Aarogyam will never ask for your OTP.</li>
                  <li>Ignore this email if you didn't request a password reset.</li>
                </ul>
              </div>

              <!-- Need Help Section -->
              <table width='100%' cellpadding='0' cellspacing='0' border='0' style='border-top: 1px solid #eee7db; padding-top: 20px;'>
                <tr>
                  <td width='36' style='vertical-align: middle;'>
                    <div style='width:30px; height:30px; border-radius:50%; background-color:#f4eee4; text-align:center; line-height:30px;'>
                      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#0b392b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='vertical-align:middle;'>
                        <path d='M3 18v-6a9 9 0 0 1 18 0v6'/><path d='M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z'/>
                      </svg>
                    </div>
                  </td>
                  <td style='vertical-align: middle;'>
                    <div style='font-size: 13.5px; font-weight: 600; color: #0b392b;'>
                      Need help?
                    </div>
                    <div style='font-size: 12.5px; color: #5a7364;'>
                      Contact us at <a href='mailto:support@aarogyam.health' style='color: #0b392b; font-weight: 600; text-decoration: underline;'>support@aarogyam.health</a>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style='padding: 22px 32px 28px; background-color: #ffffff; border-top: 1px solid #eee7db; text-align: center;'>
              <!-- Center Heartbeat Icon Badge -->
              <div style='display:inline-block; width:32px; height:32px; border-radius:50%; background-color:#f4eee4; text-align:center; line-height:32px; margin-bottom: 10px;'>
                <svg width='16' height='16' viewBox='0 0 32 32' fill='none' style='vertical-align:middle;'>
                  <path d='M7 17h5l2.5-6 3.5 10 2.5-6.5L22 17h3' stroke='#0b392b' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>
                </svg>
              </div>
              <p style='margin: 0 0 4px; font-size: 12px; color: #708578;'>
                © {year} Aarogyam. All rights reserved.
              </p>
              <p style='margin: 0; font-size: 12px; font-weight: 600; color: #0b392b;'>
                Your Digital Health Identity
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
