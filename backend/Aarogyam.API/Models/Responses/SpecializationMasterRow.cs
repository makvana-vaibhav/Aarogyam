namespace Aarogyam.API.Models.Responses;

public class SpecializationMasterRow
{
    public int SpecializationId { get; set; }

    public string SpecializationName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
