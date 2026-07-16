namespace Aarogyam.API.Models.Responses;

public class OtpManageResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? OtpId { get; set; }
}