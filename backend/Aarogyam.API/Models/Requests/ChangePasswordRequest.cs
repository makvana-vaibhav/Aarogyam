using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class ChangePasswordRequest
{
    [Required(ErrorMessage = "Please enter your current password.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please enter a new password.")]
    [MinLength(6, ErrorMessage = "New password must be at least 6 characters.")]
    [MaxLength(200, ErrorMessage = "New password is too long. Please use 200 characters or fewer.")]
    public string NewPassword { get; set; } = string.Empty;
}
