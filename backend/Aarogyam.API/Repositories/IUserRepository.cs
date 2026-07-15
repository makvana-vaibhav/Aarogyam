using Aarogyam.API.Models;

namespace Aarogyam.API.Repositories;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllAsync();
}
