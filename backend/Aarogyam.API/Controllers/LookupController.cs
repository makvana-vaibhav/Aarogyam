using Aarogyam.API.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Aarogyam.API.Controllers;

// Public, unauthenticated read-only lookups for registration forms (country/state/city,
// hospital/degree/specialization) - reuses IAdminRepository's existing Get methods since
// the data itself isn't sensitive, only the write endpoints on AdminController need Admin auth.
[ApiController]
[Route("api/lookup")]
public class LookupController : ControllerBase
{
    private readonly IAdminRepository _adminRepository;

    public LookupController(IAdminRepository adminRepository)
    {
        _adminRepository = adminRepository;
    }

    [HttpGet("countries")]
    public async Task<IActionResult> GetCountries()
    {
        return Ok(await _adminRepository.GetCountriesAsync());
    }

    [HttpGet("states")]
    public async Task<IActionResult> GetStates([FromQuery] int? countryId)
    {
        return Ok(await _adminRepository.GetStatesAsync(countryId));
    }

    [HttpGet("cities")]
    public async Task<IActionResult> GetCities([FromQuery] int? stateId)
    {
        return Ok(await _adminRepository.GetCitiesAsync(stateId));
    }

    [HttpGet("hospitals")]
    public async Task<IActionResult> GetHospitals()
    {
        return Ok(await _adminRepository.GetHospitalsAsync());
    }

    [HttpGet("degrees")]
    public async Task<IActionResult> GetDegrees()
    {
        return Ok(await _adminRepository.GetDegreesAsync());
    }

    [HttpGet("specializations")]
    public async Task<IActionResult> GetSpecializations()
    {
        return Ok(await _adminRepository.GetSpecializationsAsync());
    }

    [HttpGet("diagnosis-types")]
    public async Task<IActionResult> GetDiagnosisTypes()
    {
        return Ok(await _adminRepository.GetDiagnosisTypesAsync());
    }
}
