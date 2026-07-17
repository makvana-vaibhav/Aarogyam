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

    public async Task SendOtpEmailAsync(string toEmail, string otpCode)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = "Your Aarogyam verification code";
        message.Body = new TextPart("html")
{
    Text = $@"
<!DOCTYPE html>
<html>
<head>
<meta charset='UTF-8'>
<title>Aarogyam Verification</title>
</head>

<body style='margin:0;padding:0;background:#0B0F0D;font-family:Segoe UI,Arial,sans-serif;'>

<table width='100%' cellpadding='0' cellspacing='0' style='padding:40px 0;background:#0B0F0D;'>
<tr>
<td align='center'>

<table width='600' cellpadding='0' cellspacing='0'
style='background:#161B17;border-radius:12px;overflow:hidden;
box-shadow:0 12px 35px rgba(0,0,0,.45);'>

<tr>
<td style='background:#0D1110;padding:28px;text-align:center;border-bottom:1px solid #1E4D38;'>

<h1 style='color:#FFFFFF;margin:0;font-size:28px;font-weight:700;'>
Aarogyam
</h1>

</td>
</tr>

<tr>
<td style='padding:40px;'>

<h2 style='margin-top:0;color:#FFFFFF;'>
Verify your email address
</h2>

<p style='font-size:16px;color:#C9D1D9;line-height:1.7;'>
Hello,
</p>

<p style='font-size:16px;color:#C9D1D9;line-height:1.7;'>
Thank you for registering with <strong style='color:#FFFFFF;'>Aarogyam</strong>.
Use the verification code below to complete your registration.
</p>

<div style='margin:35px 0;text-align:center;'>

<div style='display:inline-block;
background:#101E18;
border:1px solid #2F6F4F;
padding:20px 48px;
border-radius:10px;
font-size:38px;
font-weight:700;
letter-spacing:12px;
font-family:Consolas,monospace;
color:#7FE3A1;'>

{otpCode}

</div>

</div>

<p style='font-size:15px;color:#8B949E;text-align:center;'>
This OTP is valid for <strong style='color:#FFFFFF;'>10 minutes</strong>.
</p>

<hr style='margin:35px 0;border:none;border-top:1px solid #30363D;'>

<p style='font-size:14px;color:#8B949E;line-height:1.7;'>

If you didn't request this verification code,
you can safely ignore this email.

</p>

<p style='font-size:14px;color:#8B949E;line-height:1.7;'>

For security reasons, never share your verification code with anyone.

</p>

</td>
</tr>

<tr>

<td style='background:#0D1110;padding:25px;text-align:center;
font-size:13px;color:#8B949E;
border-top:1px solid #1E4D38;'>

© {DateTime.Now.Year} Aarogyam

<br><br>

Healthcare Management System

</td>

</tr>

</table>

</td>
</tr>
</table>

</body>
</html>"
};

        using var client = new SmtpClient();
        try
        {
            await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_settings.SenderEmail, _settings.SenderPassword);
            await client.SendAsync(message);
        }
        finally
        {
            if (client.IsConnected)
            {
                await client.DisconnectAsync(true);
            }
        }
    }
}
