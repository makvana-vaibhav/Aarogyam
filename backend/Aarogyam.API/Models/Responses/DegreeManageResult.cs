namespace Aarogyam.API.Models.Responses;

public class DegreeManageResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? DegreeId { get; set; }
}
