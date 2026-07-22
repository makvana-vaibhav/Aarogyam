namespace Aarogyam.API.Models.Responses;

public class CountryMasterRow
{
    public int CountryId { get; set; }

    public string CountryName { get; set; } = string.Empty;

    public string CountryCode { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
