namespace Aarogyam.API.Models.Responses;

public class SpecializationManageResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? SpecializationId { get; set; }
}
