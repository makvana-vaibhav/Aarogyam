using Aarogyam.API.Data;
using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Repositories;

public class AdminRepository : IAdminRepository
{
    private readonly AarogyamDbContext _context;

    public AdminRepository(AarogyamDbContext context)
    {
        _context = context;
    }

    // ================= Role Master =================

    public Task<List<RoleMasterRow>> GetRolesAsync()
    {
        return _context.RoleMasterRows
            .FromSqlRaw("EXEC dbo.spRoleMasterGet @RoleId = NULL")
            .ToListAsync();
    }

    public async Task<RoleMasterRow?> GetRoleByIdAsync(int id)
    {
        var rows = await _context.RoleMasterRows
            .FromSqlRaw("EXEC dbo.spRoleMasterGet @RoleId = {0}", id)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<RoleManageResult?> CreateRoleAsync(RoleRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "INSERT"),
            new SqlParameter("@RoleId", DBNull.Value),
            new SqlParameter("@RoleName", request.RoleName)
        };

        var results = await _context.RoleManageResults
            .FromSqlRaw("EXEC dbo.spRoleMasterManage @Action, @RoleId, @RoleName", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<RoleManageResult?> UpdateRoleAsync(int id, RoleRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "UPDATE"),
            new SqlParameter("@RoleId", id),
            new SqlParameter("@RoleName", request.RoleName)
        };

        var results = await _context.RoleManageResults
            .FromSqlRaw("EXEC dbo.spRoleMasterManage @Action, @RoleId, @RoleName", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<RoleManageResult?> DeleteRoleAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "DELETE"),
            new SqlParameter("@RoleId", id),
            new SqlParameter("@RoleName", DBNull.Value)
        };

        var results = await _context.RoleManageResults
            .FromSqlRaw("EXEC dbo.spRoleMasterManage @Action, @RoleId, @RoleName", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    // ================= Country Master =================

    public Task<List<CountryMasterRow>> GetCountriesAsync()
    {
        return _context.CountryMasterRows
            .FromSqlRaw("EXEC dbo.spCountryMasterGet @CountryId = NULL")
            .ToListAsync();
    }

    public async Task<CountryMasterRow?> GetCountryByIdAsync(int id)
    {
        var rows = await _context.CountryMasterRows
            .FromSqlRaw("EXEC dbo.spCountryMasterGet @CountryId = {0}", id)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<CountryManageResult?> CreateCountryAsync(CountryRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "INSERT"),
            new SqlParameter("@CountryId", DBNull.Value),
            new SqlParameter("@CountryName", request.CountryName),
            new SqlParameter("@CountryCode", request.CountryCode),
            new SqlParameter("@IsActive", request.IsActive)
        };

        var results = await _context.CountryManageResults
            .FromSqlRaw("EXEC dbo.spCountryMasterManage @Action, @CountryId, @CountryName, @CountryCode, @IsActive", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<CountryManageResult?> UpdateCountryAsync(int id, CountryRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "UPDATE"),
            new SqlParameter("@CountryId", id),
            new SqlParameter("@CountryName", request.CountryName),
            new SqlParameter("@CountryCode", request.CountryCode),
            new SqlParameter("@IsActive", request.IsActive)
        };

        var results = await _context.CountryManageResults
            .FromSqlRaw("EXEC dbo.spCountryMasterManage @Action, @CountryId, @CountryName, @CountryCode, @IsActive", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<CountryManageResult?> DeleteCountryAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "DELETE"),
            new SqlParameter("@CountryId", id),
            new SqlParameter("@CountryName", DBNull.Value),
            new SqlParameter("@CountryCode", DBNull.Value),
            new SqlParameter("@IsActive", DBNull.Value)
        };

        var results = await _context.CountryManageResults
            .FromSqlRaw("EXEC dbo.spCountryMasterManage @Action, @CountryId, @CountryName, @CountryCode, @IsActive", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    // ================= State Master =================

    public Task<List<StateMasterRow>> GetStatesAsync(int? countryId)
    {
        var parameters = new[]
        {
            new SqlParameter("@StateId", DBNull.Value),
            new SqlParameter("@CountryId", (object?)countryId ?? DBNull.Value)
        };

        return _context.StateMasterRows
            .FromSqlRaw("EXEC dbo.spStateMasterGet @StateId, @CountryId", parameters)
            .ToListAsync();
    }

    public async Task<StateMasterRow?> GetStateByIdAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@StateId", id),
            new SqlParameter("@CountryId", DBNull.Value)
        };

        var rows = await _context.StateMasterRows
            .FromSqlRaw("EXEC dbo.spStateMasterGet @StateId, @CountryId", parameters)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<StateManageResult?> CreateStateAsync(StateRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "INSERT"),
            new SqlParameter("@StateId", DBNull.Value),
            new SqlParameter("@CountryId", request.CountryId),
            new SqlParameter("@StateName", request.StateName)
        };

        var results = await _context.StateManageResults
            .FromSqlRaw("EXEC dbo.spStateMasterManage @Action, @StateId, @CountryId, @StateName", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<StateManageResult?> UpdateStateAsync(int id, StateRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "UPDATE"),
            new SqlParameter("@StateId", id),
            new SqlParameter("@CountryId", request.CountryId),
            new SqlParameter("@StateName", request.StateName)
        };

        var results = await _context.StateManageResults
            .FromSqlRaw("EXEC dbo.spStateMasterManage @Action, @StateId, @CountryId, @StateName", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<StateManageResult?> DeleteStateAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "DELETE"),
            new SqlParameter("@StateId", id),
            new SqlParameter("@CountryId", DBNull.Value),
            new SqlParameter("@StateName", DBNull.Value)
        };

        var results = await _context.StateManageResults
            .FromSqlRaw("EXEC dbo.spStateMasterManage @Action, @StateId, @CountryId, @StateName", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    // ================= City Master =================

    public Task<List<CityMasterRow>> GetCitiesAsync(int? stateId)
    {
        var parameters = new[]
        {
            new SqlParameter("@CityId", DBNull.Value),
            new SqlParameter("@StateId", (object?)stateId ?? DBNull.Value)
        };

        return _context.CityMasterRows
            .FromSqlRaw("EXEC dbo.spCityMasterGet @CityId, @StateId", parameters)
            .ToListAsync();
    }

    public async Task<CityMasterRow?> GetCityByIdAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@CityId", id),
            new SqlParameter("@StateId", DBNull.Value)
        };

        var rows = await _context.CityMasterRows
            .FromSqlRaw("EXEC dbo.spCityMasterGet @CityId, @StateId", parameters)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<CityManageResult?> CreateCityAsync(CityRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "INSERT"),
            new SqlParameter("@CityId", DBNull.Value),
            new SqlParameter("@StateId", request.StateId),
            new SqlParameter("@CityName", request.CityName)
        };

        var results = await _context.CityManageResults
            .FromSqlRaw("EXEC dbo.spCityMasterManage @Action, @CityId, @StateId, @CityName", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<CityManageResult?> UpdateCityAsync(int id, CityRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "UPDATE"),
            new SqlParameter("@CityId", id),
            new SqlParameter("@StateId", request.StateId),
            new SqlParameter("@CityName", request.CityName)
        };

        var results = await _context.CityManageResults
            .FromSqlRaw("EXEC dbo.spCityMasterManage @Action, @CityId, @StateId, @CityName", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<CityManageResult?> DeleteCityAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "DELETE"),
            new SqlParameter("@CityId", id),
            new SqlParameter("@StateId", DBNull.Value),
            new SqlParameter("@CityName", DBNull.Value)
        };

        var results = await _context.CityManageResults
            .FromSqlRaw("EXEC dbo.spCityMasterManage @Action, @CityId, @StateId, @CityName", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    // ================= Hospital Master =================

    public Task<List<HospitalMasterRow>> GetHospitalsAsync()
    {
        return _context.HospitalMasterRows
            .FromSqlRaw("EXEC dbo.spHospitalMasterGet @HospitalId = NULL")
            .ToListAsync();
    }

    public async Task<HospitalMasterRow?> GetHospitalByIdAsync(int id)
    {
        var rows = await _context.HospitalMasterRows
            .FromSqlRaw("EXEC dbo.spHospitalMasterGet @HospitalId = {0}", id)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<HospitalManageResult?> CreateHospitalAsync(HospitalRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "INSERT"),
            new SqlParameter("@HospitalId", DBNull.Value),
            new SqlParameter("@HospitalName", request.HospitalName),
            new SqlParameter("@Address", request.Address),
            new SqlParameter("@CityId", request.CityId),
            new SqlParameter("@PhoneNumber", (object?)request.PhoneNumber ?? DBNull.Value),
            new SqlParameter("@Email", (object?)request.Email ?? DBNull.Value),
            new SqlParameter("@IsActive", request.IsActive)
        };

        var results = await _context.HospitalManageResults
            .FromSqlRaw(
                "EXEC dbo.spHospitalMasterManage @Action, @HospitalId, @HospitalName, @Address, @CityId, @PhoneNumber, @Email, @IsActive",
                parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<HospitalManageResult?> UpdateHospitalAsync(int id, HospitalRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "UPDATE"),
            new SqlParameter("@HospitalId", id),
            new SqlParameter("@HospitalName", request.HospitalName),
            new SqlParameter("@Address", request.Address),
            new SqlParameter("@CityId", request.CityId),
            new SqlParameter("@PhoneNumber", (object?)request.PhoneNumber ?? DBNull.Value),
            new SqlParameter("@Email", (object?)request.Email ?? DBNull.Value),
            new SqlParameter("@IsActive", request.IsActive)
        };

        var results = await _context.HospitalManageResults
            .FromSqlRaw(
                "EXEC dbo.spHospitalMasterManage @Action, @HospitalId, @HospitalName, @Address, @CityId, @PhoneNumber, @Email, @IsActive",
                parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<HospitalManageResult?> DeleteHospitalAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "DELETE"),
            new SqlParameter("@HospitalId", id),
            new SqlParameter("@HospitalName", DBNull.Value),
            new SqlParameter("@Address", DBNull.Value),
            new SqlParameter("@CityId", DBNull.Value),
            new SqlParameter("@PhoneNumber", DBNull.Value),
            new SqlParameter("@Email", DBNull.Value),
            new SqlParameter("@IsActive", DBNull.Value)
        };

        var results = await _context.HospitalManageResults
            .FromSqlRaw(
                "EXEC dbo.spHospitalMasterManage @Action, @HospitalId, @HospitalName, @Address, @CityId, @PhoneNumber, @Email, @IsActive",
                parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    // ================= Degree Master =================

    public Task<List<DegreeMasterRow>> GetDegreesAsync()
    {
        return _context.DegreeMasterRows
            .FromSqlRaw("EXEC dbo.spDegreeMasterGet @DegreeId = NULL")
            .ToListAsync();
    }

    public async Task<DegreeMasterRow?> GetDegreeByIdAsync(int id)
    {
        var rows = await _context.DegreeMasterRows
            .FromSqlRaw("EXEC dbo.spDegreeMasterGet @DegreeId = {0}", id)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<DegreeManageResult?> CreateDegreeAsync(DegreeRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "INSERT"),
            new SqlParameter("@DegreeId", DBNull.Value),
            new SqlParameter("@DegreeName", request.DegreeName),
            new SqlParameter("@ShortName", request.ShortName),
            new SqlParameter("@Description", (object?)request.Description ?? DBNull.Value)
        };

        var results = await _context.DegreeManageResults
            .FromSqlRaw("EXEC dbo.spDegreeMasterManage @Action, @DegreeId, @DegreeName, @ShortName, @Description", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<DegreeManageResult?> UpdateDegreeAsync(int id, DegreeRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "UPDATE"),
            new SqlParameter("@DegreeId", id),
            new SqlParameter("@DegreeName", request.DegreeName),
            new SqlParameter("@ShortName", request.ShortName),
            new SqlParameter("@Description", (object?)request.Description ?? DBNull.Value)
        };

        var results = await _context.DegreeManageResults
            .FromSqlRaw("EXEC dbo.spDegreeMasterManage @Action, @DegreeId, @DegreeName, @ShortName, @Description", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<DegreeManageResult?> DeleteDegreeAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "DELETE"),
            new SqlParameter("@DegreeId", id),
            new SqlParameter("@DegreeName", DBNull.Value),
            new SqlParameter("@ShortName", DBNull.Value),
            new SqlParameter("@Description", DBNull.Value)
        };

        var results = await _context.DegreeManageResults
            .FromSqlRaw("EXEC dbo.spDegreeMasterManage @Action, @DegreeId, @DegreeName, @ShortName, @Description", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    // ================= Specialization Master =================

    public Task<List<SpecializationMasterRow>> GetSpecializationsAsync()
    {
        return _context.SpecializationMasterRows
            .FromSqlRaw("EXEC dbo.spSpecializationMasterGet @SpecializationId = NULL")
            .ToListAsync();
    }

    public async Task<SpecializationMasterRow?> GetSpecializationByIdAsync(int id)
    {
        var rows = await _context.SpecializationMasterRows
            .FromSqlRaw("EXEC dbo.spSpecializationMasterGet @SpecializationId = {0}", id)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<SpecializationManageResult?> CreateSpecializationAsync(SpecializationRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "INSERT"),
            new SqlParameter("@SpecializationId", DBNull.Value),
            new SqlParameter("@SpecializationName", request.SpecializationName),
            new SqlParameter("@Description", (object?)request.Description ?? DBNull.Value)
        };

        var results = await _context.SpecializationManageResults
            .FromSqlRaw("EXEC dbo.spSpecializationMasterManage @Action, @SpecializationId, @SpecializationName, @Description", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<SpecializationManageResult?> UpdateSpecializationAsync(int id, SpecializationRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "UPDATE"),
            new SqlParameter("@SpecializationId", id),
            new SqlParameter("@SpecializationName", request.SpecializationName),
            new SqlParameter("@Description", (object?)request.Description ?? DBNull.Value)
        };

        var results = await _context.SpecializationManageResults
            .FromSqlRaw("EXEC dbo.spSpecializationMasterManage @Action, @SpecializationId, @SpecializationName, @Description", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<SpecializationManageResult?> DeleteSpecializationAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "DELETE"),
            new SqlParameter("@SpecializationId", id),
            new SqlParameter("@SpecializationName", DBNull.Value),
            new SqlParameter("@Description", DBNull.Value)
        };

        var results = await _context.SpecializationManageResults
            .FromSqlRaw("EXEC dbo.spSpecializationMasterManage @Action, @SpecializationId, @SpecializationName, @Description", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    // ================= Diagnosis Type Master =================

    public Task<List<DiagnosisTypeMasterRow>> GetDiagnosisTypesAsync()
    {
        return _context.DiagnosisTypeMasterRows
            .FromSqlRaw("EXEC dbo.spDiagnosisTypeMasterGet @DiagnosisTypeId = NULL")
            .ToListAsync();
    }

    public async Task<DiagnosisTypeMasterRow?> GetDiagnosisTypeByIdAsync(int id)
    {
        var rows = await _context.DiagnosisTypeMasterRows
            .FromSqlRaw("EXEC dbo.spDiagnosisTypeMasterGet @DiagnosisTypeId = {0}", id)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<DiagnosisTypeManageResult?> CreateDiagnosisTypeAsync(DiagnosisTypeRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "INSERT"),
            new SqlParameter("@DiagnosisTypeId", DBNull.Value),
            new SqlParameter("@DiagnosisTypeName", request.DiagnosisTypeName),
            new SqlParameter("@Description", (object?)request.Description ?? DBNull.Value),
            new SqlParameter("@IsActive", request.IsActive)
        };

        var results = await _context.DiagnosisTypeManageResults
            .FromSqlRaw("EXEC dbo.spDiagnosisTypeMasterManage @Action, @DiagnosisTypeId, @DiagnosisTypeName, @Description, @IsActive", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<DiagnosisTypeManageResult?> UpdateDiagnosisTypeAsync(int id, DiagnosisTypeRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "UPDATE"),
            new SqlParameter("@DiagnosisTypeId", id),
            new SqlParameter("@DiagnosisTypeName", request.DiagnosisTypeName),
            new SqlParameter("@Description", (object?)request.Description ?? DBNull.Value),
            new SqlParameter("@IsActive", request.IsActive)
        };

        var results = await _context.DiagnosisTypeManageResults
            .FromSqlRaw("EXEC dbo.spDiagnosisTypeMasterManage @Action, @DiagnosisTypeId, @DiagnosisTypeName, @Description, @IsActive", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<DiagnosisTypeManageResult?> DeleteDiagnosisTypeAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@Action", "DELETE"),
            new SqlParameter("@DiagnosisTypeId", id),
            new SqlParameter("@DiagnosisTypeName", DBNull.Value),
            new SqlParameter("@Description", DBNull.Value),
            new SqlParameter("@IsActive", DBNull.Value)
        };

        var results = await _context.DiagnosisTypeManageResults
            .FromSqlRaw("EXEC dbo.spDiagnosisTypeMasterManage @Action, @DiagnosisTypeId, @DiagnosisTypeName, @Description, @IsActive", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    // ================= User Management =================

    public Task<List<UserMasterRow>> GetUsersAsync()
    {
        return _context.UserMasterRows
            .FromSqlRaw("EXEC dbo.spUsersGet @UserId = NULL, @Email = NULL")
            .ToListAsync();
    }

    public async Task<UserMasterRow?> GetUserByIdAsync(int id)
    {
        var rows = await _context.UserMasterRows
            .FromSqlRaw("EXEC dbo.spUsersGet @UserId = {0}, @Email = NULL", id)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<UserManageResult?> ActivateUserAsync(int id)
    {
        return await SetUserActiveAsync(id, true);
    }

    public async Task<UserManageResult?> DeactivateUserAsync(int id)
    {
        return await SetUserActiveAsync(id, false);
    }

    private async Task<UserManageResult?> SetUserActiveAsync(int id, bool isActive)
    {
        var user = await GetUserByIdAsync(id);
        if (user is null) return null;

        var parameters = new[]
        {
            new SqlParameter("@Action", "UPDATE"),
            new SqlParameter("@UserId", id),
            new SqlParameter("@RoleId", user.RoleId),
            new SqlParameter("@Email", user.Email),
            new SqlParameter("@PhoneNumber", user.PhoneNumber),
            new SqlParameter("@PasswordHash", user.PasswordHash),
            new SqlParameter("@IsEmailVerified", user.IsEmailVerified),
            new SqlParameter("@IsActive", isActive),
            new SqlParameter("@LastLoginAt", (object?)user.LastLoginAt ?? DBNull.Value)
        };

        var results = await _context.UserManageResults
            .FromSqlRaw(
                "EXEC dbo.spUsersManage @Action, @UserId, @RoleId, @Email, @PhoneNumber, @PasswordHash, @IsEmailVerified, @IsActive, @LastLoginAt",
                parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    // ================= Doctor Verification =================

    public Task<List<DoctorMasterRow>> GetDoctorsAsync(string? approvalStatus)
    {
        var parameters = new[]
        {
            new SqlParameter("@DoctorId", DBNull.Value),
            new SqlParameter("@UserId", DBNull.Value),
            new SqlParameter("@ApprovalStatus", (object?)approvalStatus ?? DBNull.Value)
        };

        return _context.DoctorMasterRows
            .FromSqlRaw("EXEC dbo.spDoctorsGet @DoctorId, @UserId, @ApprovalStatus", parameters)
            .ToListAsync();
    }

    public async Task<DoctorMasterRow?> GetDoctorByIdAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@DoctorId", id),
            new SqlParameter("@UserId", DBNull.Value),
            new SqlParameter("@ApprovalStatus", DBNull.Value)
        };

        var rows = await _context.DoctorMasterRows
            .FromSqlRaw("EXEC dbo.spDoctorsGet @DoctorId, @UserId, @ApprovalStatus", parameters)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    public async Task<DoctorActionResult?> ApproveDoctorAsync(int doctorId, int approvedByUserId)
    {
        var parameters = new[]
        {
            new SqlParameter("@DoctorId", doctorId),
            new SqlParameter("@ApprovedByUserId", approvedByUserId)
        };

        var results = await _context.DoctorActionResults
            .FromSqlRaw("EXEC dbo.spApproveDoctor @DoctorId, @ApprovedByUserId", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    public async Task<DoctorActionResult?> RejectDoctorAsync(int doctorId, int approvedByUserId, string rejectionReason)
    {
        var parameters = new[]
        {
            new SqlParameter("@DoctorId", doctorId),
            new SqlParameter("@ApprovedByUserId", approvedByUserId),
            new SqlParameter("@RejectionReason", rejectionReason)
        };

        var results = await _context.DoctorActionResults
            .FromSqlRaw("EXEC dbo.spRejectDoctor @DoctorId, @ApprovedByUserId, @RejectionReason", parameters)
            .ToListAsync();
        return results.FirstOrDefault();
    }

    // ================= Patient Directory =================

    public Task<List<PatientMasterRow>> GetPatientsAsync(string? searchName)
    {
        var parameters = new[]
        {
            new SqlParameter("@PatientId", DBNull.Value),
            new SqlParameter("@UserId", DBNull.Value),
            new SqlParameter("@AarogyamId", DBNull.Value),
            new SqlParameter("@SearchName", (object?)searchName ?? DBNull.Value)
        };

        return _context.PatientMasterRows
            .FromSqlRaw("EXEC dbo.spPatientsGet @PatientId, @UserId, @AarogyamId, @SearchName", parameters)
            .ToListAsync();
    }

    public async Task<PatientMasterRow?> GetPatientByIdAsync(int id)
    {
        var parameters = new[]
        {
            new SqlParameter("@PatientId", id),
            new SqlParameter("@UserId", DBNull.Value),
            new SqlParameter("@AarogyamId", DBNull.Value),
            new SqlParameter("@SearchName", DBNull.Value)
        };

        var rows = await _context.PatientMasterRows
            .FromSqlRaw("EXEC dbo.spPatientsGet @PatientId, @UserId, @AarogyamId, @SearchName", parameters)
            .ToListAsync();
        return rows.FirstOrDefault();
    }

    // ================= Audit Logs =================

    public Task<List<AuditLogRow>> GetAuditLogsAsync(int? userId)
    {
        var parameters = new[]
        {
            new SqlParameter("@AuditLogId", DBNull.Value),
            new SqlParameter("@UserId", (object?)userId ?? DBNull.Value)
        };

        return _context.AuditLogRows
            .FromSqlRaw("EXEC dbo.spAuditLogsGet @AuditLogId, @UserId", parameters)
            .ToListAsync();
    }

    // ================= Dashboard =================

    public async Task<DashboardStatsResult?> GetDashboardStatsAsync()
    {
        var results = await _context.DashboardStatsResults
            .FromSqlRaw("EXEC dbo.spAdminDashboardStats")
            .ToListAsync();
        return results.FirstOrDefault();
    }
}
