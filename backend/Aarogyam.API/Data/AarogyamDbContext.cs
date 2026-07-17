using Aarogyam.API.Models.Responses;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Data;

public class AarogyamDbContext : DbContext
{
    public AarogyamDbContext(DbContextOptions<AarogyamDbContext> options)
        : base(options)
    {
    }

    public DbSet<RegisterPatientResult> RegisterPatientResults { get; set; }
// This represents a view that returns the result of registering a patient
    public DbSet<RegisterDoctorResult> RegisterDoctorResults { get; set; }

    public DbSet<VerifyOtpResult> VerifyOtpResults { get; set; }

    public DbSet<LoginResult> LoginResults { get; set; }

    public DbSet<ResendOtpResult> ResendOtpResults { get; set; }

    public DbSet<OtpManageResult> OtpManageResults { get; set; }

    public DbSet<DoctorApprovalResult> DoctorApprovalResults { get; set; }

    public DbSet<UserLookupResult> UserLookupResults { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<RegisterPatientResult>(entity =>
        {
            entity.HasNoKey(); //because this is a result set, not a table so no primary key is defined
            entity.ToView(null);
        });

        modelBuilder.Entity<RegisterDoctorResult>(entity =>
        {
            entity.HasNoKey(); //because this is a result set, not a table so no primary key is defined
            entity.ToView(null);
        });

        modelBuilder.Entity<VerifyOtpResult>(entity =>
        {
            entity.HasNoKey();
            entity.ToView(null);
        });

        modelBuilder.Entity<LoginResult>(entity =>
        {
            entity.HasNoKey();
            entity.ToView(null);
        });

        modelBuilder.Entity<ResendOtpResult>(entity =>
        {
            entity.HasNoKey();
            entity.ToView(null);
        });

        modelBuilder.Entity<OtpManageResult>(entity =>
        {
            entity.HasNoKey();
            entity.ToView(null);
        });

        modelBuilder.Entity<DoctorApprovalResult>(entity =>
        {
            entity.HasNoKey();
            entity.ToView(null);
        });

        modelBuilder.Entity<UserLookupResult>(entity =>
        {
            entity.HasNoKey();
            entity.ToView(null);
        });
    }
}