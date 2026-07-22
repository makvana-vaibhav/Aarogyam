using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Aarogyam.API.Repositories;

namespace Aarogyam.API.Services;

public class AdminService : IAdminService
{
    private readonly IAdminRepository _adminRepository;

    public AdminService(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    // Role Master
    public Task<List<RoleMasterRow>> GetRolesAsync() => _adminRepository.GetRolesAsync();
    public Task<RoleMasterRow?> GetRoleByIdAsync(int id) => _adminRepository.GetRoleByIdAsync(id);
    public Task<RoleManageResult?> CreateRoleAsync(RoleRequest request) => _adminRepository.CreateRoleAsync(request);
    public Task<RoleManageResult?> UpdateRoleAsync(int id, RoleRequest request) => _adminRepository.UpdateRoleAsync(id, request);
    public Task<RoleManageResult?> DeleteRoleAsync(int id) => _adminRepository.DeleteRoleAsync(id);

    // Country Master
    public Task<List<CountryMasterRow>> GetCountriesAsync() => _adminRepository.GetCountriesAsync();
    public Task<CountryMasterRow?> GetCountryByIdAsync(int id) => _adminRepository.GetCountryByIdAsync(id);
    public Task<CountryManageResult?> CreateCountryAsync(CountryRequest request) => _adminRepository.CreateCountryAsync(request);
    public Task<CountryManageResult?> UpdateCountryAsync(int id, CountryRequest request) => _adminRepository.UpdateCountryAsync(id, request);
    public Task<CountryManageResult?> DeleteCountryAsync(int id) => _adminRepository.DeleteCountryAsync(id);

    // State Master
    public Task<List<StateMasterRow>> GetStatesAsync(int? countryId) => _adminRepository.GetStatesAsync(countryId);
    public Task<StateMasterRow?> GetStateByIdAsync(int id) => _adminRepository.GetStateByIdAsync(id);
    public Task<StateManageResult?> CreateStateAsync(StateRequest request) => _adminRepository.CreateStateAsync(request);
    public Task<StateManageResult?> UpdateStateAsync(int id, StateRequest request) => _adminRepository.UpdateStateAsync(id, request);
    public Task<StateManageResult?> DeleteStateAsync(int id) => _adminRepository.DeleteStateAsync(id);

    // City Master
    public Task<List<CityMasterRow>> GetCitiesAsync(int? stateId) => _adminRepository.GetCitiesAsync(stateId);
    public Task<CityMasterRow?> GetCityByIdAsync(int id) => _adminRepository.GetCityByIdAsync(id);
    public Task<CityManageResult?> CreateCityAsync(CityRequest request) => _adminRepository.CreateCityAsync(request);
    public Task<CityManageResult?> UpdateCityAsync(int id, CityRequest request) => _adminRepository.UpdateCityAsync(id, request);
    public Task<CityManageResult?> DeleteCityAsync(int id) => _adminRepository.DeleteCityAsync(id);

    // Hospital Master
    public Task<List<HospitalMasterRow>> GetHospitalsAsync() => _adminRepository.GetHospitalsAsync();
    public Task<HospitalMasterRow?> GetHospitalByIdAsync(int id) => _adminRepository.GetHospitalByIdAsync(id);
    public Task<HospitalManageResult?> CreateHospitalAsync(HospitalRequest request) => _adminRepository.CreateHospitalAsync(request);
    public Task<HospitalManageResult?> UpdateHospitalAsync(int id, HospitalRequest request) => _adminRepository.UpdateHospitalAsync(id, request);
    public Task<HospitalManageResult?> DeleteHospitalAsync(int id) => _adminRepository.DeleteHospitalAsync(id);

    // Degree Master
    public Task<List<DegreeMasterRow>> GetDegreesAsync() => _adminRepository.GetDegreesAsync();
    public Task<DegreeMasterRow?> GetDegreeByIdAsync(int id) => _adminRepository.GetDegreeByIdAsync(id);
    public Task<DegreeManageResult?> CreateDegreeAsync(DegreeRequest request) => _adminRepository.CreateDegreeAsync(request);
    public Task<DegreeManageResult?> UpdateDegreeAsync(int id, DegreeRequest request) => _adminRepository.UpdateDegreeAsync(id, request);
    public Task<DegreeManageResult?> DeleteDegreeAsync(int id) => _adminRepository.DeleteDegreeAsync(id);

    // Specialization Master
    public Task<List<SpecializationMasterRow>> GetSpecializationsAsync() => _adminRepository.GetSpecializationsAsync();
    public Task<SpecializationMasterRow?> GetSpecializationByIdAsync(int id) => _adminRepository.GetSpecializationByIdAsync(id);
    public Task<SpecializationManageResult?> CreateSpecializationAsync(SpecializationRequest request) => _adminRepository.CreateSpecializationAsync(request);
    public Task<SpecializationManageResult?> UpdateSpecializationAsync(int id, SpecializationRequest request) => _adminRepository.UpdateSpecializationAsync(id, request);
    public Task<SpecializationManageResult?> DeleteSpecializationAsync(int id) => _adminRepository.DeleteSpecializationAsync(id);

    // Diagnosis Type Master
    public Task<List<DiagnosisTypeMasterRow>> GetDiagnosisTypesAsync() => _adminRepository.GetDiagnosisTypesAsync();
    public Task<DiagnosisTypeMasterRow?> GetDiagnosisTypeByIdAsync(int id) => _adminRepository.GetDiagnosisTypeByIdAsync(id);
    public Task<DiagnosisTypeManageResult?> CreateDiagnosisTypeAsync(DiagnosisTypeRequest request) => _adminRepository.CreateDiagnosisTypeAsync(request);
    public Task<DiagnosisTypeManageResult?> UpdateDiagnosisTypeAsync(int id, DiagnosisTypeRequest request) => _adminRepository.UpdateDiagnosisTypeAsync(id, request);
    public Task<DiagnosisTypeManageResult?> DeleteDiagnosisTypeAsync(int id) => _adminRepository.DeleteDiagnosisTypeAsync(id);

    // User management
    public Task<List<UserMasterRow>> GetUsersAsync() => _adminRepository.GetUsersAsync();
    public Task<UserMasterRow?> GetUserByIdAsync(int id) => _adminRepository.GetUserByIdAsync(id);
    public Task<UserManageResult?> ActivateUserAsync(int id) => _adminRepository.ActivateUserAsync(id);
    public Task<UserManageResult?> DeactivateUserAsync(int id) => _adminRepository.DeactivateUserAsync(id);

    // Doctor verification
    public Task<List<DoctorMasterRow>> GetDoctorsAsync(string? approvalStatus) => _adminRepository.GetDoctorsAsync(approvalStatus);
    public Task<DoctorMasterRow?> GetDoctorByIdAsync(int id) => _adminRepository.GetDoctorByIdAsync(id);
    public Task<DoctorActionResult?> ApproveDoctorAsync(int doctorId, int approvedByUserId) => _adminRepository.ApproveDoctorAsync(doctorId, approvedByUserId);
    public Task<DoctorActionResult?> RejectDoctorAsync(int doctorId, int approvedByUserId, string rejectionReason) => _adminRepository.RejectDoctorAsync(doctorId, approvedByUserId, rejectionReason);

    // Patient directory
    public Task<List<PatientMasterRow>> GetPatientsAsync(string? searchName) => _adminRepository.GetPatientsAsync(searchName);
    public Task<PatientMasterRow?> GetPatientByIdAsync(int id) => _adminRepository.GetPatientByIdAsync(id);

    // Audit logs
    public Task<List<AuditLogRow>> GetAuditLogsAsync(int? userId) => _adminRepository.GetAuditLogsAsync(userId);

    // Dashboard
    public Task<DashboardStatsResult?> GetDashboardStatsAsync() => _adminRepository.GetDashboardStatsAsync();
}
