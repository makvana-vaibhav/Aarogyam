using Aarogyam.API.Helpers;
using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Aarogyam.API.Repositories;
using Aarogyam.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aarogyam.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthRepository _authRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IFileStorageService _fileStorageService;
    private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp" };

    public AuthController(IAuthRepository authRepository, IAuditLogRepository auditLogRepository, IFileStorageService fileStorageService)
    {
        _authRepository = authRepository;
        _auditLogRepository = auditLogRepository;
        _fileStorageService = fileStorageService;
    }

    [HttpPost("upload-document")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadDocument([FromForm] FileUploadRequest request)
    {
        var file = request.File;
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { success = 0, message = "No file was uploaded." });
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var isPdf = ext == ".pdf";
        var isImage = AllowedImageExtensions.Contains(ext);
        if (!isPdf && !isImage)
        {
            return BadRequest(new { success = 0, message = "Only PDF documents or JPG/PNG/WEBP images are allowed." });
        }

        var maxSizeBytes = isPdf ? 10 * 1024 * 1024 : 3 * 1024 * 1024;
        if (file.Length > maxSizeBytes)
        {
            var limitText = isPdf ? "10MB" : "3MB";
            return BadRequest(new { success = 0, message = $"File size cannot exceed {limitText}." });
        }

        var fileName = $"{Guid.NewGuid():N}{ext}";
        await using var stream = file.OpenReadStream();
        var relativePath = await _fileStorageService.SaveAsync("documents", fileName, stream);

        return Ok(new { success = 1, filePath = relativePath });
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
            result.Message = DbErrorMessageMapper.Friendly(result.Message);
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
            result.Message = DbErrorMessageMapper.Friendly(result.Message);
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
            result.Message = DbErrorMessageMapper.Friendly(result.Message);
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
            result.Message = DbErrorMessageMapper.Friendly(result.Message);
            return BadRequest(result);
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
            result.Message = DbErrorMessageMapper.Friendly(result.Message);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ForgotPasswordResult>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var result = await _authRepository.ForgotPasswordAsync(request);

        if (result is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new ForgotPasswordResult
            {
                Success = 0,
                Message = "Unable to process forgot password request."
            });
        }

        if (result.Success == 0)
        {
            result.Message = DbErrorMessageMapper.Friendly(result.Message);
            return BadRequest(result);
        }

        if (result.UserId.HasValue)
        {
            await _auditLogRepository.LogAsync(result.UserId, "FORGOT_PASSWORD_REQUEST", "Users", result.UserId.Value);
        }

        return Ok(result);
    }

    [HttpPost("verify-forgot-otp")]
    public async Task<ActionResult<SimpleResult>> VerifyForgotOtp([FromBody] VerifyForgotOtpRequest request)
    {
        var result = await _authRepository.VerifyForgotOtpAsync(request);

        if (result is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new SimpleResult
            {
                Success = 0,
                Message = "Unable to verify OTP code."
            });
        }

        if (result.Success == 0)
        {
            result.Message = DbErrorMessageMapper.Friendly(result.Message);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<SimpleResult>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var result = await _authRepository.ResetPasswordAsync(request);

        if (result is null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new SimpleResult
            {
                Success = 0,
                Message = "Unable to reset password."
            });
        }

        if (result.Success == 0)
        {
            result.Message = DbErrorMessageMapper.Friendly(result.Message);
            return BadRequest(result);
        }

        await _auditLogRepository.LogAsync(request.UserId, "RESET_PASSWORD", "Users", request.UserId);

        return Ok(result);
    }
}