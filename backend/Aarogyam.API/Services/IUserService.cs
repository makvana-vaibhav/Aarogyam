using Aarogyam.API.Models;

namespace Aarogyam.API.Services;

public interface IUserService
{
    Task<IEnumerable<User>> GetAllUsersAsync();
}
