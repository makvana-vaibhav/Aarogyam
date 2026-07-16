using System.ComponentModel.DataAnnotations;

namespace Aarogyam.API.Models.Requests;

public class VerifyOtpRequest
{
    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(10)]
    public string OtpCode { get; set; } = string.Empty;
}