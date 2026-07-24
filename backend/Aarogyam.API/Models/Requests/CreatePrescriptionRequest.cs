using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class CreatePrescriptionRequest
{
    [Required]
    public int VisitId { get; set; }

    public int? DiagnosisId { get; set; }

    [Required]
    public string PrescriptionText { get; set; } = string.Empty;

    [Required]
    public DateTime PrescriptionDate { get; set; }
}
