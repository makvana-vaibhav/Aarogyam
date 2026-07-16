using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;

namespace Aarogyam.API.Services;

public interface IAuthService
{
    Task<RegisterPatientResult?> RegisterPatientAsync(RegisterPatientRequest request);
}