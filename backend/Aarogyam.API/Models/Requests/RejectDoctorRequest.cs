using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class RejectDoctorRequest
{
    [Required]
    [MaxLength(200)]
    public string RejectionReason { get; set; } = string.Empty;
}
