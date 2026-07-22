namespace Aarogyam.API.Models.Responses;

public class StateMasterRow
{
    public int StateId { get; set; }

    public int CountryId { get; set; }

    public string StateName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
