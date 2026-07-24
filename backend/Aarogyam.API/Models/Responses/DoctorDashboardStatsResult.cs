namespace Aarogyam.API.Models.Responses;

public class DoctorDashboardStatsResult
{
    public int PatientsTreated { get; set; }

    public int TotalVisits { get; set; }

    public int VisitsToday { get; set; }

    public int DiagnosesThisWeek { get; set; }

    public int PrescriptionsThisWeek { get; set; }
}
