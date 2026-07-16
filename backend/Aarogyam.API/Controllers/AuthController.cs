using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Aarogyam.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aarogyam.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register/patient")]
    public async Task<ActionResult<RegisterPatientResult>> RegisterPatient([FromBody] RegisterPatientRequest request)
    {
        var result = await _authService.RegisterPatientAsync(request);

        if (result is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new RegisterPatientResult
            {
                Success = 0,
                Message = "Unable to register patient."
            });
        }

        if (result.Success == 0)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("register/doctor")]
    public async Task<ActionResult<RegisterDoctorResult>> RegisterDoctor([FromBody] RegisterDoctorRequest request)
    {
        var result = await _authService.RegisterDoctorAsync(request);

        if (result is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new RegisterDoctorResult
            {
                Success = 0,
                Message = "Unable to register doctor."
            });
        }

        if (result.Success == 0)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}