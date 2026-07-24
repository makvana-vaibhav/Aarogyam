namespace Aarogyam.API.Models.Responses;

public class PatientDashboardStatsResult
{
    public int TotalVisits { get; set; }

    public DateTime? LastVisitDate { get; set; }

    public int TotalDiagnoses { get; set; }

    public int TotalPrescriptions { get; set; }

    public int TotalReports { get; set; }

    public int ReportsThisMonth { get; set; }

    public int UnreadNotifications { get; set; }
}
