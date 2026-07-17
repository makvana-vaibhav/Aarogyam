using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;

namespace Aarogyam.API.Services;

public interface IAuthService
{
    // task = asynchronous operation that returns a result of type RegisterPatientResult or null if the operation fails
    Task<RegisterPatientResult?> RegisterPatientAsync(RegisterPatientRequest request);

    Task<RegisterDoctorResult?> RegisterDoctorAsync(RegisterDoctorRequest request);

    Task<VerifyOtpResult?> VerifyOtpAsync(VerifyOtpRequest request);

    Task<LoginResult?> LoginAsync(LoginRequest request);

    Task<ResendOtpResult?> ResendOtpAsync(ResendOtpRequest request);
}