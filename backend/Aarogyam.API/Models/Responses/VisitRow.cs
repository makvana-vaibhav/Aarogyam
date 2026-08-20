using System.Text.Json.Serialization;
using Aarogyam.API.Helpers;

namespace Aarogyam.API.Models.Responses;

public class VisitRow
{
    public int VisitId { get; set; }

    public int PatientId { get; set; }

    public int DoctorId { get; set; }

    [JsonConverter(typeof(IstDateTimeConverter))]
    public DateTime VisitDate { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
