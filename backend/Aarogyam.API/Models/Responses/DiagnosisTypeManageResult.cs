namespace Aarogyam.API.Models.Responses;

public class DiagnosisTypeManageResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? DiagnosisTypeId { get; set; }
}
