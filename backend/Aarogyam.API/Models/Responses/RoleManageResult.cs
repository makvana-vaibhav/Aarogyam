namespace Aarogyam.API.Models.Responses;

public class RoleManageResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? RoleId { get; set; }
}
