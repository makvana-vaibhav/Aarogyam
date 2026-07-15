using Aarogyam.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Data;

public class AarogyamDbContext : DbContext
{
    public AarogyamDbContext(DbContextOptions<AarogyamDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}