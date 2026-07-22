using System.Text.Json.Serialization;

namespace Aarogyam.API.Models.Responses;

public class LoginResult
{
    public int Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public int? UserId { get; set; }

    public string? Email { get; set; }

    [JsonIgnore]
    public string? PasswordHash { get; set; }

    public string? RoleName { get; set; }

    public bool IsEmailVerified { get; set; }

    public string? ApprovalStatus { get; set; }

    public string? Token { get; set; }
}