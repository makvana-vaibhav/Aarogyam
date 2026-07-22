namespace Aarogyam.API.Models.Responses;

public class StateManageResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? StateId { get; set; }
}
