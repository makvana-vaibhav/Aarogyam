namespace Aarogyam.API.Models.Responses;

public class CityManageResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? CityId { get; set; }
}
