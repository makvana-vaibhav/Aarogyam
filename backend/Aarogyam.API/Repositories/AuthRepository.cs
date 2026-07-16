using Aarogyam.API.Data;
using Aarogyam.API.Models.Requests;
using Aarogyam.API.Models.Responses;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Repositories;

public class AuthRepository : IAuthRepository
{
    private readonly AarogyamDbContext _context;

    public AuthRepository(AarogyamDbContext context)
    {
        _context = context;
    }

    public async Task<RegisterPatientResult?> RegisterPatientAsync(RegisterPatientRequest request)
    {
        var parameters = new[]
        {
            new SqlParameter("@Email", request.Email),
            new SqlParameter("@PhoneNumber", request.PhoneNumber),
            new SqlParameter("@PasswordHash", request.PasswordHash),
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

        return results.FirstOrDefault();
    }
}