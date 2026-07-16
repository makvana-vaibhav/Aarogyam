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
}