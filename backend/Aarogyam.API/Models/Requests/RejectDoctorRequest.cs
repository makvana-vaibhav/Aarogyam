using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class RejectDoctorRequest
{
    [Required(ErrorMessage = "Please provide a reason for rejecting this doctor.")]
    [MaxLength(200, ErrorMessage = "Rejection reason must be 200 characters or fewer.")]
    public string RejectionReason { get; set; } = string.Empty;
}
