namespace Aarogyam.API.Models.Responses;

public class ForgotPasswordResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? UserId { get; set; }
}
