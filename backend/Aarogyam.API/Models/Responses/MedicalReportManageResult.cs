namespace Aarogyam.API.Models.Responses;

public class MedicalReportManageResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? ReportId { get; set; }
}
