namespace Aarogyam.API.Models.Responses;

public class HospitalMasterRow
{
    public int HospitalId { get; set; }

    public string HospitalName { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public int CityId { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
