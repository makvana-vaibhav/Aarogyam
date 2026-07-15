using Aarogyam.API.Data;
using Aarogyam.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AarogyamDbContext _context;

    public UserRepository(AarogyamDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users
            .FromSqlRaw("EXEC dbo.spUsersGet")
            .ToListAsync();
    }
}
