using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class RoleRequest
{
    [Required(ErrorMessage = "Please enter the role name.")]
    [MaxLength(20, ErrorMessage = "Role name must be 20 characters or fewer.")]
    public string RoleName { get; set; } = string.Empty;
}
