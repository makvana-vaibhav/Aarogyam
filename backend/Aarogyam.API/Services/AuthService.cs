using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Aarogyam.API.Repositories;

namespace Aarogyam.API.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepository;

    public AuthService(IAuthRepository authRepository)
    {
        _authRepository = authRepository;
    }

    public Task<RegisterPatientResult?> RegisterPatientAsync(RegisterPatientRequest request)
    {
        return _authRepository.RegisterPatientAsync(request);
    }

    public Task<RegisterDoctorResult?> RegisterDoctorAsync(RegisterDoctorRequest request)
    {
        return _authRepository.RegisterDoctorAsync(request);
    }

    public Task<VerifyOtpResult?> VerifyOtpAsync(VerifyOtpRequest request)
    {
        return _authRepository.VerifyOtpAsync(request);
    }

    public Task<LoginResult?> LoginAsync(LoginRequest request)
    {
        return _authRepository.LoginAsync(request);
    }

    public Task<ResendOtpResult?> ResendOtpAsync(ResendOtpRequest request)
    {
        return _authRepository.ResendOtpAsync(request);
    }
}