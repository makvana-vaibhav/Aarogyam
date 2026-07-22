using Aarogyam.API.Data;
using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Aarogyam.API.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly AarogyamDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthRepository> _logger;

    public AuthRepository(
        AarogyamDbContext context,
        IEmailService emailService,
        ITokenService tokenService,
        ILogger<AuthRepository> logger)
    {
        _context = context;
        _emailService = emailService;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<RegisterPatientResult?> RegisterPatientAsync(RegisterPatientRequest request)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var parameters = new[]
        {
            new SqlParameter("@Email", request.Email),
            new SqlParameter("@PhoneNumber", request.PhoneNumber),
            new SqlParameter("@PasswordHash", passwordHash),
            new SqlParameter("@FirstName", request.FirstName),
            new SqlParameter("@MiddleName", (object?)request.MiddleName ?? DBNull.Value),
            new SqlParameter("@LastName", request.LastName),
            new SqlParameter("@DateOfBirth", request.DateOfBirth),
            new SqlParameter("@Gender", request.Gender),
            new SqlParameter("@BloodGroup", (object?)request.BloodGroup ?? DBNull.Value),
            new SqlParameter("@Address", request.Address),
            new SqlParameter("@CountryId", request.CountryId),
            new SqlParameter("@StateId", request.StateId),
            new SqlParameter("@CityId", request.CityId),
            new SqlParameter("@EmergencyContact", (object?)request.EmergencyContact ?? DBNull.Value)
        };

        var results = await _context.RegisterPatientResults
            .FromSqlRaw(
                "EXEC dbo.spRegisterPatient @Email, @PhoneNumber, @PasswordHash, @FirstName, @MiddleName, @LastName, @DateOfBirth, @Gender, @BloodGroup, @Address, @CountryId, @StateId, @CityId, @EmergencyContact",
                parameters)
            .ToListAsync();

        var result = results.FirstOrDefault();

        if (result?.Success == 1 && result.UserId.HasValue)
        {
            await CreateAndSendOtpAsync(result.UserId.Value, request.Email);
        }

        return result;
    }

    public async Task<RegisterDoctorResult?> RegisterDoctorAsync(RegisterDoctorRequest request)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var parameters = new[]
        {
            new SqlParameter("@Email", request.Email),
            new SqlParameter("@PhoneNumber", request.PhoneNumber),
            new SqlParameter("@PasswordHash", passwordHash),
            new SqlParameter("@FirstName", request.FirstName),
            new SqlParameter("@MiddleName", request.MiddleName),
            new SqlParameter("@LastName", request.LastName),
            new SqlParameter("@LicenseNumber", request.LicenseNumber),
            new SqlParameter("@HospitalId", request.HospitalId),
            new SqlParameter("@DegreeId", request.DegreeId),
            new SqlParameter("@SpecializationId", request.SpecializationId),
            new SqlParameter("@LicenseDocumentPath", request.LicenseDocumentPath),
            new SqlParameter("@DegreeDocumentPath", request.DegreeDocumentPath),
            new SqlParameter("@Address", request.Address),
            new SqlParameter("@CountryId", request.CountryId),
            new SqlParameter("@StateId", request.StateId),
            new SqlParameter("@CityId", request.CityId)
        };

        var results = await _context.RegisterDoctorResults
            .FromSqlRaw(
                "EXEC dbo.spRegisterDoctor @Email, @PhoneNumber, @PasswordHash, @FirstName, @MiddleName, @LastName, @LicenseNumber, @HospitalId, @DegreeId, @SpecializationId, @LicenseDocumentPath, @DegreeDocumentPath, @Address, @CountryId, @StateId, @CityId",
                parameters)
            .ToListAsync();

        var result = results.FirstOrDefault();

        if (result?.Success == 1 && result.UserId.HasValue)
        {
            await CreateAndSendOtpAsync(result.UserId.Value, request.Email);
        }

        return result;
    }

    public async Task<VerifyOtpResult?> VerifyOtpAsync(VerifyOtpRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@UserId", request.UserId),
            new SqlParameter("@OtpCode", request.OtpCode)
        };

        var results = await _context.VerifyOtpResults
            .FromSqlRaw("EXEC dbo.spVerifyOtp @UserId, @OtpCode", parameters)
            .ToListAsync();

        return results.FirstOrDefault();
    }

    public async Task<LoginResult?> LoginAsync(LoginRequest request)
    {
        var loginParameters = new[]
        {
            new SqlParameter("@Email", request.Email)
        };

        var loginResults = await _context.LoginResults
            .FromSqlRaw("EXEC dbo.spLogin @Email", loginParameters)
            .ToListAsync();

        var loginResult = loginResults.FirstOrDefault();

        if (loginResult is null || loginResult.Success == 0)
        {
            return loginResult;
        }

        if (string.IsNullOrEmpty(loginResult.PasswordHash) ||
            !BCrypt.Net.BCrypt.Verify(request.Password, loginResult.PasswordHash))
        {
            return new LoginResult
            {
                Success = 0,
                Message = "Invalid password."
            };
        }

        if (!loginResult.IsEmailVerified)
        {
            return new LoginResult
            {
                Success = 0,
                Message = "Email is not verified yet."
            };
        }

        if (string.Equals(loginResult.RoleName, "Doctor", StringComparison.OrdinalIgnoreCase))
        {
            var doctorResults = await _context.DoctorApprovalResults
                .FromSqlRaw("EXEC dbo.spDoctorsGet @UserId = {0}", loginResult.UserId)
                .ToListAsync();

            var doctor = doctorResults.FirstOrDefault();
            if (doctor is null)
            {
                return new LoginResult
                {
                    Success = 0,
                    Message = "Doctor profile not found."
                };
            }

            if (!string.Equals(doctor.ApprovalStatus, "Approved", StringComparison.OrdinalIgnoreCase))
            {
                return new LoginResult
                {
                    Success = 0,
                    Message = "Doctor account is waiting for approval.",
                    UserId = loginResult.UserId,
                    Email = loginResult.Email,
                    RoleName = loginResult.RoleName,
                    IsEmailVerified = loginResult.IsEmailVerified,
                    ApprovalStatus = doctor.ApprovalStatus
                };
            }

            loginResult.ApprovalStatus = doctor.ApprovalStatus;
        }

        loginResult.Token = _tokenService.GenerateToken(loginResult.UserId!.Value, loginResult.Email!, loginResult.RoleName!);
        loginResult.PasswordHash = null;
        return loginResult;
    }

    public async Task<ResendOtpResult?> ResendOtpAsync(ResendOtpRequest request)
    {
        var users = await _context.UserLookupResults
            .FromSqlRaw("EXEC dbo.spUsersGet @Email = {0}", request.Email)
            .ToListAsync();

        var user = users.FirstOrDefault();
        if (user is null)
        {
            return new ResendOtpResult
            {
                Success = 0,
                Message = "No account found with this email."
            };
        }

        var otp = await CreateAndSendOtpAsync(user.UserId, request.Email);

        return new ResendOtpResult
        {
            Success = otp.Success ? 1 : 0,
            Message = otp.Message,
            UserId = user.UserId,
            OtpId = otp.OtpId,
            OtpCode = otp.OtpCode,
            ExpiresAt = otp.ExpiresAt
        };
    }

    private async Task<(bool Success, string Message, int? OtpId, string OtpCode, DateTime ExpiresAt)> CreateAndSendOtpAsync(
        int userId, string email)
    {
        var otpCode = Random.Shared.Next(100000, 1000000).ToString();
        var expiresAt = DateTime.UtcNow.AddMinutes(10);

        var otpParameters = new[]
        {
            new SqlParameter("@Action", "INSERT"),
            new SqlParameter("@UserId", userId),
            new SqlParameter("@OtpCode", otpCode),
            new SqlParameter("@ExpiresAt", expiresAt),
            new SqlParameter("@IsUsed", false)
        };

        var results = await _context.OtpManageResults
            .FromSqlRaw(
                "EXEC dbo.spOTPMasterManage @Action, NULL, @UserId, @OtpCode, @ExpiresAt, @IsUsed",
                otpParameters)
            .ToListAsync();

        var result = results.FirstOrDefault();
        var success = result?.Success == 1;

        if (success)
        {
            try
            {
                await _emailService.SendOtpEmailAsync(email, otpCode);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send OTP email to {Email}", email);
            }
        }

        return (success, result?.Message ?? "Unable to generate OTP.", result?.OtpId, otpCode, expiresAt);
    }
}
