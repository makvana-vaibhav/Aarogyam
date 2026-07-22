using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class CityRequest
{
    [Required]
    public int StateId { get; set; }

    [Required]
    [MaxLength(100)]
    public string CityName { get; set; } = string.Empty;
}
