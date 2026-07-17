using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Aarogyam.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aarogyam.API.Controllers;

[ApiController]
[Route("api/[controller]")] // attribute routing, the route is set to "api/auth" for this controller
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;


// Initializes a new instance of the <see cref="AuthController"/> class. create custom constructor to inject the IAuthService dependency into the controller
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register/patient")]
    // Handles patient registration by receiving request data from the request body
    // and returns an HTTP response containing the registration result.
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

    [HttpPost("verify-otp")]
    public async Task<ActionResult<VerifyOtpResult>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var result = await _authService.VerifyOtpAsync(request);

        if (result is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new VerifyOtpResult
            {
                Success = 0,
                Message = "Unable to verify OTP."
            });
        }

        if (result.Success == 0)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResult>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);

        if (result is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new LoginResult
            {
                Success = 0,
                Message = "Unable to login."
            });
        }

        if (result.Success == 0)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }

    [HttpPost("resend-otp")]
    public async Task<ActionResult<ResendOtpResult>> ResendOtp([FromBody] ResendOtpRequest request)
    {
        var result = await _authService.ResendOtpAsync(request);

        if (result is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new ResendOtpResult
            {
                Success = 0,
                Message = "Unable to resend OTP."
            });
        }

        if (result.Success == 0)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}