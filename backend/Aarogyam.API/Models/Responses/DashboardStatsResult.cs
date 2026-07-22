namespace Aarogyam.API.Models.Responses;

public class DashboardStatsResult
{
    public int TotalUsers { get; set; }

    public int TotalPatients { get; set; }

    public int TotalDoctors { get; set; }

    public int PendingDoctorApprovals { get; set; }

    public int TotalHospitals { get; set; }

    public int TotalVisits { get; set; }
}
