namespace Aarogyam.API.Models.Responses;

public class DegreeMasterRow
{
    public int DegreeId { get; set; }

    public string DegreeName { get; set; } = string.Empty;

    public string ShortName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
