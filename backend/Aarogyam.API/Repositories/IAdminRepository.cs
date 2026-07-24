using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;

namespace Aarogyam.API.Repositories;

public interface IAdminRepository
{
    // Role Master
    Task<List<RoleMasterRow>> GetRolesAsync();
    Task<RoleMasterRow?> GetRoleByIdAsync(int id);
    Task<RoleManageResult?> CreateRoleAsync(RoleRequest request);
    Task<RoleManageResult?> UpdateRoleAsync(int id, RoleRequest request);
    Task<RoleManageResult?> DeleteRoleAsync(int id);

    // Country Master
    Task<List<CountryMasterRow>> GetCountriesAsync();
    Task<CountryMasterRow?> GetCountryByIdAsync(int id);
    Task<CountryManageResult?> CreateCountryAsync(CountryRequest request);
    Task<CountryManageResult?> UpdateCountryAsync(int id, CountryRequest request);
    Task<CountryManageResult?> DeleteCountryAsync(int id);

    // State Master
    Task<List<StateMasterRow>> GetStatesAsync(int? countryId);
    Task<StateMasterRow?> GetStateByIdAsync(int id);
    Task<StateManageResult?> CreateStateAsync(StateRequest request);
    Task<StateManageResult?> UpdateStateAsync(int id, StateRequest request);
    Task<StateManageResult?> DeleteStateAsync(int id);

    // City Master
    Task<List<CityMasterRow>> GetCitiesAsync(int? stateId);
    Task<CityMasterRow?> GetCityByIdAsync(int id);
    Task<CityManageResult?> CreateCityAsync(CityRequest request);
    Task<CityManageResult?> UpdateCityAsync(int id, CityRequest request);
    Task<CityManageResult?> DeleteCityAsync(int id);

    // Hospital Master
    Task<List<HospitalMasterRow>> GetHospitalsAsync();
    Task<HospitalMasterRow?> GetHospitalByIdAsync(int id);
    Task<HospitalManageResult?> CreateHospitalAsync(HospitalRequest request);
    Task<HospitalManageResult?> UpdateHospitalAsync(int id, HospitalRequest request);
    Task<HospitalManageResult?> DeleteHospitalAsync(int id);

    // Degree Master
    Task<List<DegreeMasterRow>> GetDegreesAsync();
    Task<DegreeMasterRow?> GetDegreeByIdAsync(int id);
    Task<DegreeManageResult?> CreateDegreeAsync(DegreeRequest request);
    Task<DegreeManageResult?> UpdateDegreeAsync(int id, DegreeRequest request);
    Task<DegreeManageResult?> DeleteDegreeAsync(int id);

    // Specialization Master
    Task<List<SpecializationMasterRow>> GetSpecializationsAsync();
    Task<SpecializationMasterRow?> GetSpecializationByIdAsync(int id);
    Task<SpecializationManageResult?> CreateSpecializationAsync(SpecializationRequest request);
    Task<SpecializationManageResult?> UpdateSpecializationAsync(int id, SpecializationRequest request);
    Task<SpecializationManageResult?> DeleteSpecializationAsync(int id);

    // Diagnosis Type Master
    Task<List<DiagnosisTypeMasterRow>> GetDiagnosisTypesAsync();
    Task<DiagnosisTypeMasterRow?> GetDiagnosisTypeByIdAsync(int id);
    Task<DiagnosisTypeManageResult?> CreateDiagnosisTypeAsync(DiagnosisTypeRequest request);
    Task<DiagnosisTypeManageResult?> UpdateDiagnosisTypeAsync(int id, DiagnosisTypeRequest request);
    Task<DiagnosisTypeManageResult?> DeleteDiagnosisTypeAsync(int id);

    // User management
    Task<List<UserMasterRow>> GetUsersAsync();
    Task<UserMasterRow?> GetUserByIdAsync(int id);
    Task<SimpleResult?> ActivateUserAsync(int id);
    Task<SimpleResult?> DeactivateUserAsync(int id);

    // Doctor verification
    Task<List<DoctorMasterRow>> GetDoctorsAsync(string? approvalStatus);
    Task<DoctorMasterRow?> GetDoctorByIdAsync(int id);
    Task<DoctorActionResult?> ApproveDoctorAsync(int doctorId, int approvedByUserId);
    Task<DoctorActionResult?> RejectDoctorAsync(int doctorId, int approvedByUserId, string rejectionReason);

    // Patient directory (read-only)
    Task<List<PatientMasterRow>> GetPatientsAsync(string? searchName);
    Task<PatientMasterRow?> GetPatientByIdAsync(int id);

    // Audit logs (read-only)
    Task<List<AuditLogRow>> GetAuditLogsAsync(int? userId);

    // Dashboard
    Task<DashboardStatsResult?> GetDashboardStatsAsync();
}
