using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class RoleRequest
{
    [Required]
    [MaxLength(20)]
    public string RoleName { get; set; } = string.Empty;
}
