using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class CreatePrescriptionRequest
{
    [Required(ErrorMessage = "Please select a visit.")]
    public int VisitId { get; set; }

    public int? DiagnosisId { get; set; }

    [Required(ErrorMessage = "Please enter the prescription details.")]
    public string PrescriptionText { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please select the prescription date.")]
    public DateTime PrescriptionDate { get; set; }
}
