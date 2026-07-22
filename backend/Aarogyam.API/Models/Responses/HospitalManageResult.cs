namespace Aarogyam.API.Models.Responses;

public class HospitalManageResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? HospitalId { get; set; }
}
