namespace Aarogyam.API.Services;

public interface ITokenService
{
    string GenerateToken(int userId, string email, string roleName);
}
