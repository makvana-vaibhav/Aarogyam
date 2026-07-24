using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class CreateVisitRequest
{
    [Required]
    public int PatientId { get; set; }

    [Required]
    public DateTime VisitDate { get; set; }

    public string? Notes { get; set; }
}
