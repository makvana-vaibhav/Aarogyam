namespace Aarogyam.API.Models.Responses;

public class ResendOtpResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? UserId { get; set; }

    public int? OtpId { get; set; }

    public string? OtpCode { get; set; }

    public DateTime? ExpiresAt { get; set; }
}