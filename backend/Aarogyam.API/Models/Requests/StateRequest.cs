using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class StateRequest
{
    [Required]
    public int CountryId { get; set; }

    [Required]
    [MaxLength(100)]
    public string StateName { get; set; } = string.Empty;
}
