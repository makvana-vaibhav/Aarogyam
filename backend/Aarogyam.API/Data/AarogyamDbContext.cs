using Aarogyam.API.Models;
using Aarogyam.API.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Data;

public class AarogyamDbContext : DbContext
{
    public AarogyamDbContext(DbContextOptions<AarogyamDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }

    public DbSet<RegisterPatientResult> RegisterPatientResults { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<RegisterPatientResult>(entity =>
        {
            entity.HasNoKey();
            entity.ToView(null);
        });
    }
}