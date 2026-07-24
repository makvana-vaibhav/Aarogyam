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

    public DbSet<RoleMasterRow> RoleMasterRows { get; set; }
    public DbSet<RoleManageResult> RoleManageResults { get; set; }

    public DbSet<CountryMasterRow> CountryMasterRows { get; set; }
    public DbSet<CountryManageResult> CountryManageResults { get; set; }

    public DbSet<StateMasterRow> StateMasterRows { get; set; }
    public DbSet<StateManageResult> StateManageResults { get; set; }

    public DbSet<CityMasterRow> CityMasterRows { get; set; }
    public DbSet<CityManageResult> CityManageResults { get; set; }

    public DbSet<HospitalMasterRow> HospitalMasterRows { get; set; }
    public DbSet<HospitalManageResult> HospitalManageResults { get; set; }

    public DbSet<DegreeMasterRow> DegreeMasterRows { get; set; }
    public DbSet<DegreeManageResult> DegreeManageResults { get; set; }

    public DbSet<SpecializationMasterRow> SpecializationMasterRows { get; set; }
    public DbSet<SpecializationManageResult> SpecializationManageResults { get; set; }

    public DbSet<DiagnosisTypeMasterRow> DiagnosisTypeMasterRows { get; set; }
    public DbSet<DiagnosisTypeManageResult> DiagnosisTypeManageResults { get; set; }

    public DbSet<UserMasterRow> UserMasterRows { get; set; }

    public DbSet<DoctorMasterRow> DoctorMasterRows { get; set; }
    public DbSet<DoctorActionResult> DoctorActionResults { get; set; }

    public DbSet<PatientMasterRow> PatientMasterRows { get; set; }

    public DbSet<AuditLogRow> AuditLogRows { get; set; }

    public DbSet<DashboardStatsResult> DashboardStatsResults { get; set; }

    public DbSet<VisitRow> VisitRows { get; set; }

    public DbSet<DiagnosisRow> DiagnosisRows { get; set; }

    public DbSet<PrescriptionRow> PrescriptionRows { get; set; }

    public DbSet<MedicalReportRow> MedicalReportRows { get; set; }
    public DbSet<MedicalReportManageResult> MedicalReportManageResults { get; set; }

    public DbSet<NotificationRow> NotificationRows { get; set; }

    public DbSet<SimpleResult> SimpleResults { get; set; }

    public DbSet<PrescriptionDetailsRow> PrescriptionDetailsRows { get; set; }

    public DbSet<PatientDashboardStatsResult> PatientDashboardStatsResults { get; set; }

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
            entity.Ignore(e => e.Token); //generated in C# after the SP call, never part of the SQL result set
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

        modelBuilder.Entity<RoleMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
        modelBuilder.Entity<RoleManageResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<CountryMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
        modelBuilder.Entity<CountryManageResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<StateMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
        modelBuilder.Entity<StateManageResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<CityMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
        modelBuilder.Entity<CityManageResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<HospitalMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
        modelBuilder.Entity<HospitalManageResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<DegreeMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
        modelBuilder.Entity<DegreeManageResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<SpecializationMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
        modelBuilder.Entity<SpecializationManageResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<DiagnosisTypeMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
        modelBuilder.Entity<DiagnosisTypeManageResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<UserMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<DoctorMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
        modelBuilder.Entity<DoctorActionResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<PatientMasterRow>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<AuditLogRow>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<DashboardStatsResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<VisitRow>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<DiagnosisRow>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<PrescriptionRow>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<MedicalReportRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
        modelBuilder.Entity<MedicalReportManageResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<NotificationRow>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<PatientDashboardStatsResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<SimpleResult>(entity => { entity.HasNoKey(); entity.ToView(null); });

        modelBuilder.Entity<PrescriptionDetailsRow>(entity => { entity.HasNoKey(); entity.ToView(null); });
    }
}