using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class StateRequest
{
    [Required(ErrorMessage = "Please select a country.")]
    public int CountryId { get; set; }

    [Required(ErrorMessage = "Please enter the state name.")]
    [MaxLength(100, ErrorMessage = "State name must be 100 characters or fewer.")]
    public string StateName { get; set; } = string.Empty;
}
