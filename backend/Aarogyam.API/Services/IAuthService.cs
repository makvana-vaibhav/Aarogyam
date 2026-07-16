using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;

namespace Aarogyam.API.Services;

public interface IAuthService
{
    Task<RegisterPatientResult?> RegisterPatientAsync(RegisterPatientRequest request);

    Task<RegisterDoctorResult?> RegisterDoctorAsync(RegisterDoctorRequest request);

    Task<VerifyOtpResult?> VerifyOtpAsync(VerifyOtpRequest request);

    Task<LoginResult?> LoginAsync(LoginRequest request);

    Task<ResendOtpResult?> ResendOtpAsync(ResendOtpRequest request);
}