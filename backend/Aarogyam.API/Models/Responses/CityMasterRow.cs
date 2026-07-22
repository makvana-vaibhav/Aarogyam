namespace Aarogyam.API.Models.Responses;

public class CityMasterRow
{
    public int CityId { get; set; }

    public int StateId { get; set; }

    public string CityName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
