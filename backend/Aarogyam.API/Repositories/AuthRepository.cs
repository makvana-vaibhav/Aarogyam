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

            // spRegisterPatient has no @ProfilePicturePath parameter, so persist an
            // optional registration-time photo with a follow-up call to
            // spPatientsUpdateProfile (which already accepts it) instead.
            if (!string.IsNullOrWhiteSpace(request.ProfilePicturePath))
            {
                await SetPatientProfilePictureAsync(result.UserId.Value, request);
            }
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
            new SqlParameter("@MiddleName", (object?)request.MiddleName ?? DBNull.Value),
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

            // spRegisterDoctor has no @ProfilePicturePath parameter, so persist an
            // optional registration-time photo with a follow-up call to
            // spDoctorsUpdateProfile (which already accepts it) instead.
            if (!string.IsNullOrWhiteSpace(request.ProfilePicturePath))
            {
                await SetDoctorProfilePictureAsync(result.UserId.Value, request);
            }
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
            var doctorResults = await _context.DoctorMasterRows
                .FromSqlRaw("EXEC dbo.spDoctorsGet @DoctorId, @UserId, @ApprovalStatus",
                    new SqlParameter("@DoctorId", DBNull.Value),
                    new SqlParameter("@UserId", loginResult.UserId),
                    new SqlParameter("@ApprovalStatus", DBNull.Value))
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

            loginResult.ApprovalStatus = doctor.ApprovalStatus;
            loginResult.RejectionReason = doctor.RejectionReason;
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

    public async Task<ForgotPasswordResult?> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Email", request.Email)
        };

        var results = await _context.ForgotPasswordResults
            .FromSqlRaw("EXEC dbo.spForgotPassword @Email", parameters)
            .ToListAsync();

        var result = results.FirstOrDefault();
        if (result is null || result.Success == 0 || !result.UserId.HasValue)
        {
            return result ?? new ForgotPasswordResult { Success = 0, Message = "No active account found with this email." };
        }

        var otp = await CreateAndSendOtpAsync(
            result.UserId.Value,
            request.Email,
            subject: "Your Aarogyam password reset code",
            title: "Reset your password",
            subtitle: "Use the verification code below to reset your Aarogyam account password.");

        return new ForgotPasswordResult
        {
            Success = otp.Success ? 1 : 0,
            Message = otp.Success ? "Password reset code sent to your email." : otp.Message,
            UserId = result.UserId
        };
    }

    public async Task<SimpleResult?> VerifyForgotOtpAsync(VerifyForgotOtpRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@UserId", request.UserId),
            new SqlParameter("@OtpCode", request.OtpCode)
        };

        var results = await _context.SimpleResults
            .FromSqlRaw("EXEC dbo.spVerifyForgotOtp @UserId, @OtpCode", parameters)
            .ToListAsync();

        return results.FirstOrDefault();
    }

    public async Task<SimpleResult?> ResetPasswordAsync(ResetPasswordRequest request)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        var parameters = new[]
        {
            new SqlParameter("@UserId", request.UserId),
            new SqlParameter("@OtpCode", request.OtpCode),
            new SqlParameter("@NewPasswordHash", passwordHash)
        };

        var results = await _context.SimpleResults
            .FromSqlRaw("EXEC dbo.spResetPasswordWithOtp @UserId, @OtpCode, @NewPasswordHash", parameters)
            .ToListAsync();

        return results.FirstOrDefault();
    }

    private async Task<(bool Success, string Message, int? OtpId, string OtpCode, DateTime ExpiresAt)> CreateAndSendOtpAsync(
        int userId,
        string email,
        string subject = "Your Aarogyam verification code",
        string title = "Verify your email address",
        string subtitle = "Use the verification code below to complete your email verification.",
        string name = "")
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
                await _emailService.SendOtpEmailAsync(email, otpCode, subject, title, subtitle, name);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send OTP email to {Email}", email);
            }
        }

        return (success, result?.Message ?? "Unable to generate OTP.", result?.OtpId, otpCode, expiresAt);
    }

    private async Task SetPatientProfilePictureAsync(int userId, RegisterPatientRequest request)
    {
        try
        {
            var patientRows = await _context.PatientMasterRows
                .FromSqlRaw("EXEC dbo.spPatientsGet @PatientId, @UserId, @AarogyamId, @SearchName",
                    new SqlParameter("@PatientId", DBNull.Value),
                    new SqlParameter("@UserId", userId),
                    new SqlParameter("@AarogyamId", DBNull.Value),
                    new SqlParameter("@SearchName", DBNull.Value))
                .ToListAsync();

            var patient = patientRows.FirstOrDefault();
            if (patient is null) return;

            var parameters = new[]
            {
                new SqlParameter("@PatientId", patient.PatientId),
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
                new SqlParameter("@EmergencyContact", (object?)request.EmergencyContact ?? DBNull.Value),
                new SqlParameter("@ProfilePicturePath", request.ProfilePicturePath!)
            };

            await _context.SimpleResults
                .FromSqlRaw(
                    "EXEC dbo.spPatientsUpdateProfile @PatientId, @FirstName, @MiddleName, @LastName, @DateOfBirth, @Gender, @BloodGroup, @Address, @CountryId, @StateId, @CityId, @EmergencyContact, @ProfilePicturePath",
                    parameters)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            // A registration-time photo failing to save must never fail registration itself.
            _logger.LogWarning(ex, "Failed to save profile picture for newly registered patient (UserId={UserId})", userId);
        }
    }

    private async Task SetDoctorProfilePictureAsync(int userId, RegisterDoctorRequest request)
    {
        try
        {
            var doctorRows = await _context.DoctorMasterRows
                .FromSqlRaw("EXEC dbo.spDoctorsGet @DoctorId, @UserId, @ApprovalStatus",
                    new SqlParameter("@DoctorId", DBNull.Value),
                    new SqlParameter("@UserId", userId),
                    new SqlParameter("@ApprovalStatus", DBNull.Value))
                .ToListAsync();

            var doctor = doctorRows.FirstOrDefault();
            if (doctor is null) return;

            var parameters = new[]
            {
                new SqlParameter("@DoctorId", doctor.DoctorId),
                new SqlParameter("@FirstName", request.FirstName),
                new SqlParameter("@MiddleName", (object?)request.MiddleName ?? DBNull.Value),
                new SqlParameter("@LastName", request.LastName),
                new SqlParameter("@HospitalId", request.HospitalId),
                new SqlParameter("@SpecializationId", request.SpecializationId),
                new SqlParameter("@Address", request.Address),
                new SqlParameter("@CountryId", request.CountryId),
                new SqlParameter("@StateId", request.StateId),
                new SqlParameter("@CityId", request.CityId),
                new SqlParameter("@ProfilePicturePath", request.ProfilePicturePath!)
            };

            await _context.SimpleResults
                .FromSqlRaw(
                    "EXEC dbo.spDoctorsUpdateProfile @DoctorId, @FirstName, @MiddleName, @LastName, @HospitalId, @SpecializationId, @Address, @CountryId, @StateId, @CityId, @ProfilePicturePath",
                    parameters)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            // A registration-time photo failing to save must never fail registration itself.
            _logger.LogWarning(ex, "Failed to save profile picture for newly registered doctor (UserId={UserId})", userId);
        }
    }
}
