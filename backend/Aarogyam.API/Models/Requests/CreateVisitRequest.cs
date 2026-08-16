using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class CreateVisitRequest
{
    [Required(ErrorMessage = "Please select a patient.")]
    public int PatientId { get; set; }

    [Required(ErrorMessage = "Please select the visit date.")]
    public DateTime VisitDate { get; set; }

    public string? Notes { get; set; }
}
