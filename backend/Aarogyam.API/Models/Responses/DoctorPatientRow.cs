using System.Text.Json.Serialization;
using Aarogyam.API.Helpers;

namespace Aarogyam.API.Models.Responses;

public class DoctorPatientRow
{
    public int PatientId { get; set; }

    public string AarogyamId { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string? MiddleName { get; set; }

    public string LastName { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string? BloodGroup { get; set; }

    public string? Email { get; set; }

    [JsonConverter(typeof(IstNullableDateTimeConverter))]
    public DateTime? LastVisitDate { get; set; }

    public int TotalVisits { get; set; }
}
