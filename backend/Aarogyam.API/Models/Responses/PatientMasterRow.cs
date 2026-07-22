namespace Aarogyam.API.Models.Responses;

public class PatientMasterRow
{
    public int PatientId { get; set; }

    public int UserId { get; set; }

    public string AarogyamId { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string? MiddleName { get; set; }

    public string LastName { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string? BloodGroup { get; set; }

    public string Address { get; set; } = string.Empty;

    public int CountryId { get; set; }

    public int StateId { get; set; }

    public int CityId { get; set; }

    public string? EmergencyContact { get; set; }

    public string? QrCodePath { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
