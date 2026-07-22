namespace Aarogyam.API.Models.Responses;

public class UserManageResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? UserId { get; set; }
}
