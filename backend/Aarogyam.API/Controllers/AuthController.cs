using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Aarogyam.API.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Aarogyam.API.Controllers;

[ApiController]
[Route("api/[controller]")] // attribute routing, the route is set to "api/auth" for this controller
public class AuthController : ControllerBase
{
    private readonly IAuthRepository _authRepository;
    private readonly IAuditLogRepository _auditLogRepository;

    public AuthController(IAuthRepository authRepository, IAuditLogRepository auditLogRepository)
    {
        _authRepository = authRepository;
        _auditLogRepository = auditLogRepository;
    }

    [HttpPost("register/patient")]
    // Handles patient registration by receiving request data from the request body
    // and returns an HTTP response containing the registration result.
    public async Task<ActionResult<RegisterPatientResult>> RegisterPatient([FromBody] RegisterPatientRequest request)
    {
        var result = await _authRepository.RegisterPatientAsync(request);

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

        if (result.UserId.HasValue)
        {
            await _auditLogRepository.LogAsync(result.UserId, "REGISTER", "Patients", result.UserId.Value);
        }

        return Ok(result);
    }

    [HttpPost("register/doctor")]
    public async Task<ActionResult<RegisterDoctorResult>> RegisterDoctor([FromBody] RegisterDoctorRequest request)
    {
        var result = await _authRepository.RegisterDoctorAsync(request);

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

        if (result.UserId.HasValue)
        {
            await _auditLogRepository.LogAsync(result.UserId, "REGISTER", "Doctors", result.UserId.Value);
        }

        return Ok(result);
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<VerifyOtpResult>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var result = await _authRepository.VerifyOtpAsync(request);

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

        await _auditLogRepository.LogAsync(request.UserId, "VERIFY_OTP", "Users", request.UserId);

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResult>> Login([FromBody] LoginRequest request)
    {
        var result = await _authRepository.LoginAsync(request);

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

        if (result.UserId.HasValue)
        {
            await _auditLogRepository.LogAsync(result.UserId, "LOGIN", "Users", result.UserId.Value);
        }

        return Ok(result);
    }

    [HttpPost("resend-otp")]
    public async Task<ActionResult<ResendOtpResult>> ResendOtp([FromBody] ResendOtpRequest request)
    {
        var result = await _authRepository.ResendOtpAsync(request);

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