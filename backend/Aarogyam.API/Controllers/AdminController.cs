using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Aarogyam.API.Models.Requests;
using Aarogyam.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Aarogyam.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    // ================= Role Master =================

    [HttpGet("master/roles")]
    public async Task<IActionResult> GetRoles()
    {
        return Ok(await _adminService.GetRolesAsync());
    }

    [HttpGet("master/roles/{id:int}")]
    public async Task<IActionResult> GetRoleById(int id)
    {
        var role = await _adminService.GetRoleByIdAsync(id);
        return role is null ? NotFound(new { success = 0, message = "Role not found." }) : Ok(role);
    }

    [HttpPost("master/roles")]
    public async Task<IActionResult> CreateRole([FromBody] RoleRequest request)
    {
        var result = await _adminService.CreateRoleAsync(request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPut("master/roles/{id:int}")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] RoleRequest request)
    {
        var result = await _adminService.UpdateRoleAsync(id, request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("master/roles/{id:int}")]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var result = await _adminService.DeleteRoleAsync(id);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    // ================= Country Master =================

    [HttpGet("master/countries")]
    public async Task<IActionResult> GetCountries()
    {
        return Ok(await _adminService.GetCountriesAsync());
    }

    [HttpGet("master/countries/{id:int}")]
    public async Task<IActionResult> GetCountryById(int id)
    {
        var country = await _adminService.GetCountryByIdAsync(id);
        return country is null ? NotFound(new { success = 0, message = "Country not found." }) : Ok(country);
    }

    [HttpPost("master/countries")]
    public async Task<IActionResult> CreateCountry([FromBody] CountryRequest request)
    {
        var result = await _adminService.CreateCountryAsync(request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPut("master/countries/{id:int}")]
    public async Task<IActionResult> UpdateCountry(int id, [FromBody] CountryRequest request)
    {
        var result = await _adminService.UpdateCountryAsync(id, request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("master/countries/{id:int}")]
    public async Task<IActionResult> DeleteCountry(int id)
    {
        var result = await _adminService.DeleteCountryAsync(id);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    // ================= State Master =================

    [HttpGet("master/states")]
    public async Task<IActionResult> GetStates([FromQuery] int? countryId)
    {
        return Ok(await _adminService.GetStatesAsync(countryId));
    }

    [HttpGet("master/states/{id:int}")]
    public async Task<IActionResult> GetStateById(int id)
    {
        var state = await _adminService.GetStateByIdAsync(id);
        return state is null ? NotFound(new { success = 0, message = "State not found." }) : Ok(state);
    }

    [HttpPost("master/states")]
    public async Task<IActionResult> CreateState([FromBody] StateRequest request)
    {
        var result = await _adminService.CreateStateAsync(request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPut("master/states/{id:int}")]
    public async Task<IActionResult> UpdateState(int id, [FromBody] StateRequest request)
    {
        var result = await _adminService.UpdateStateAsync(id, request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("master/states/{id:int}")]
    public async Task<IActionResult> DeleteState(int id)
    {
        var result = await _adminService.DeleteStateAsync(id);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    // ================= City Master =================

    [HttpGet("master/cities")]
    public async Task<IActionResult> GetCities([FromQuery] int? stateId)
    {
        return Ok(await _adminService.GetCitiesAsync(stateId));
    }

    [HttpGet("master/cities/{id:int}")]
    public async Task<IActionResult> GetCityById(int id)
    {
        var city = await _adminService.GetCityByIdAsync(id);
        return city is null ? NotFound(new { success = 0, message = "City not found." }) : Ok(city);
    }

    [HttpPost("master/cities")]
    public async Task<IActionResult> CreateCity([FromBody] CityRequest request)
    {
        var result = await _adminService.CreateCityAsync(request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPut("master/cities/{id:int}")]
    public async Task<IActionResult> UpdateCity(int id, [FromBody] CityRequest request)
    {
        var result = await _adminService.UpdateCityAsync(id, request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("master/cities/{id:int}")]
    public async Task<IActionResult> DeleteCity(int id)
    {
        var result = await _adminService.DeleteCityAsync(id);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    // ================= Hospital Master =================

    [HttpGet("master/hospitals")]
    public async Task<IActionResult> GetHospitals()
    {
        return Ok(await _adminService.GetHospitalsAsync());
    }

    [HttpGet("master/hospitals/{id:int}")]
    public async Task<IActionResult> GetHospitalById(int id)
    {
        var hospital = await _adminService.GetHospitalByIdAsync(id);
        return hospital is null ? NotFound(new { success = 0, message = "Hospital not found." }) : Ok(hospital);
    }

    [HttpPost("master/hospitals")]
    public async Task<IActionResult> CreateHospital([FromBody] HospitalRequest request)
    {
        var result = await _adminService.CreateHospitalAsync(request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPut("master/hospitals/{id:int}")]
    public async Task<IActionResult> UpdateHospital(int id, [FromBody] HospitalRequest request)
    {
        var result = await _adminService.UpdateHospitalAsync(id, request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("master/hospitals/{id:int}")]
    public async Task<IActionResult> DeleteHospital(int id)
    {
        var result = await _adminService.DeleteHospitalAsync(id);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    // ================= Degree Master =================

    [HttpGet("master/degrees")]
    public async Task<IActionResult> GetDegrees()
    {
        return Ok(await _adminService.GetDegreesAsync());
    }

    [HttpGet("master/degrees/{id:int}")]
    public async Task<IActionResult> GetDegreeById(int id)
    {
        var degree = await _adminService.GetDegreeByIdAsync(id);
        return degree is null ? NotFound(new { success = 0, message = "Degree not found." }) : Ok(degree);
    }

    [HttpPost("master/degrees")]
    public async Task<IActionResult> CreateDegree([FromBody] DegreeRequest request)
    {
        var result = await _adminService.CreateDegreeAsync(request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPut("master/degrees/{id:int}")]
    public async Task<IActionResult> UpdateDegree(int id, [FromBody] DegreeRequest request)
    {
        var result = await _adminService.UpdateDegreeAsync(id, request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("master/degrees/{id:int}")]
    public async Task<IActionResult> DeleteDegree(int id)
    {
        var result = await _adminService.DeleteDegreeAsync(id);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    // ================= Specialization Master =================

    [HttpGet("master/specializations")]
    public async Task<IActionResult> GetSpecializations()
    {
        return Ok(await _adminService.GetSpecializationsAsync());
    }

    [HttpGet("master/specializations/{id:int}")]
    public async Task<IActionResult> GetSpecializationById(int id)
    {
        var specialization = await _adminService.GetSpecializationByIdAsync(id);
        return specialization is null ? NotFound(new { success = 0, message = "Specialization not found." }) : Ok(specialization);
    }

    [HttpPost("master/specializations")]
    public async Task<IActionResult> CreateSpecialization([FromBody] SpecializationRequest request)
    {
        var result = await _adminService.CreateSpecializationAsync(request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPut("master/specializations/{id:int}")]
    public async Task<IActionResult> UpdateSpecialization(int id, [FromBody] SpecializationRequest request)
    {
        var result = await _adminService.UpdateSpecializationAsync(id, request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("master/specializations/{id:int}")]
    public async Task<IActionResult> DeleteSpecialization(int id)
    {
        var result = await _adminService.DeleteSpecializationAsync(id);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    // ================= Diagnosis Type Master =================

    [HttpGet("master/diagnosis-types")]
    public async Task<IActionResult> GetDiagnosisTypes()
    {
        return Ok(await _adminService.GetDiagnosisTypesAsync());
    }

    [HttpGet("master/diagnosis-types/{id:int}")]
    public async Task<IActionResult> GetDiagnosisTypeById(int id)
    {
        var diagnosisType = await _adminService.GetDiagnosisTypeByIdAsync(id);
        return diagnosisType is null ? NotFound(new { success = 0, message = "Diagnosis type not found." }) : Ok(diagnosisType);
    }

    [HttpPost("master/diagnosis-types")]
    public async Task<IActionResult> CreateDiagnosisType([FromBody] DiagnosisTypeRequest request)
    {
        var result = await _adminService.CreateDiagnosisTypeAsync(request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPut("master/diagnosis-types/{id:int}")]
    public async Task<IActionResult> UpdateDiagnosisType(int id, [FromBody] DiagnosisTypeRequest request)
    {
        var result = await _adminService.UpdateDiagnosisTypeAsync(id, request);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("master/diagnosis-types/{id:int}")]
    public async Task<IActionResult> DeleteDiagnosisType(int id)
    {
        var result = await _adminService.DeleteDiagnosisTypeAsync(id);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    // ================= User Management =================

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        return Ok(await _adminService.GetUsersAsync());
    }

    [HttpGet("users/{id:int}")]
    public async Task<IActionResult> GetUserById(int id)
    {
        var user = await _adminService.GetUserByIdAsync(id);
        return user is null ? NotFound(new { success = 0, message = "User not found." }) : Ok(user);
    }

    [HttpPut("users/{id:int}/activate")]
    public async Task<IActionResult> ActivateUser(int id)
    {
        var result = await _adminService.ActivateUserAsync(id);
        if (result is null) return NotFound(new { success = 0, message = "User not found." });
        return result.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPut("users/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateUser(int id)
    {
        var result = await _adminService.DeactivateUserAsync(id);
        if (result is null) return NotFound(new { success = 0, message = "User not found." });
        return result.Success == 1 ? Ok(result) : BadRequest(result);
    }

    // ================= Doctor Verification =================

    [HttpGet("doctors")]
    public async Task<IActionResult> GetDoctors([FromQuery] string? approvalStatus)
    {
        return Ok(await _adminService.GetDoctorsAsync(approvalStatus));
    }

    [HttpGet("doctors/{id:int}")]
    public async Task<IActionResult> GetDoctorById(int id)
    {
        var doctor = await _adminService.GetDoctorByIdAsync(id);
        return doctor is null ? NotFound(new { success = 0, message = "Doctor not found." }) : Ok(doctor);
    }

    [HttpPost("doctors/{id:int}/approve")]
    public async Task<IActionResult> ApproveDoctor(int id)
    {
        var result = await _adminService.ApproveDoctorAsync(id, GetCurrentAdminUserId());
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    [HttpPost("doctors/{id:int}/reject")]
    public async Task<IActionResult> RejectDoctor(int id, [FromBody] RejectDoctorRequest request)
    {
        var result = await _adminService.RejectDoctorAsync(id, GetCurrentAdminUserId(), request.RejectionReason);
        return result?.Success == 1 ? Ok(result) : BadRequest(result);
    }

    // ================= Patient Directory =================

    [HttpGet("patients")]
    public async Task<IActionResult> GetPatients([FromQuery] string? searchName)
    {
        return Ok(await _adminService.GetPatientsAsync(searchName));
    }

    [HttpGet("patients/{id:int}")]
    public async Task<IActionResult> GetPatientById(int id)
    {
        var patient = await _adminService.GetPatientByIdAsync(id);
        return patient is null ? NotFound(new { success = 0, message = "Patient not found." }) : Ok(patient);
    }

    // ================= Audit Logs =================

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int? userId)
    {
        return Ok(await _adminService.GetAuditLogsAsync(userId));
    }

    // ================= Dashboard =================

    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        return Ok(await _adminService.GetDashboardStatsAsync());
    }

    private int GetCurrentAdminUserId()
    {
        var sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return int.Parse(sub!);
    }
}
