using Aarogyam.API.Models;
using Aarogyam.API.Repositories;

namespace Aarogyam.API.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return _userRepository.GetAllAsync();
    }
}
