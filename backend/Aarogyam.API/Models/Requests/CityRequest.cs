using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class CityRequest
{
    [Required(ErrorMessage = "Please select a state.")]
    public int StateId { get; set; }

    [Required(ErrorMessage = "Please enter the city name.")]
    [MaxLength(100, ErrorMessage = "City name must be 100 characters or fewer.")]
    public string CityName { get; set; } = string.Empty;
}
