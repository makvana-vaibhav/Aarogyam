using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;

namespace Aarogyam.API.Repositories;

public interface IAuthRepository
{
    Task<RegisterPatientResult?> RegisterPatientAsync(RegisterPatientRequest request);

    Task<RegisterDoctorResult?> RegisterDoctorAsync(RegisterDoctorRequest request);
}