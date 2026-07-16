namespace Aarogyam.API.Models.Responses;

public class DoctorApprovalResult
{
    public int DoctorId { get; set; }

    public int UserId { get; set; }

    public string ApprovalStatus { get; set; } = string.Empty;
}