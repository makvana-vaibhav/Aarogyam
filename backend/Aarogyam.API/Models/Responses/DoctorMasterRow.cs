namespace Aarogyam.API.Models.Responses;

public class DoctorMasterRow
{
    public int DoctorId { get; set; }

    public int UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string MiddleName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string LicenseNumber { get; set; } = string.Empty;

    public int HospitalId { get; set; }

    public int DegreeId { get; set; }

    public int SpecializationId { get; set; }

    public string LicenseDocumentPath { get; set; } = string.Empty;

    public string DegreeDocumentPath { get; set; } = string.Empty;

    public string ApprovalStatus { get; set; } = string.Empty;

    public int? ApprovedByUserId { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public string? RejectionReason { get; set; }

    public string Address { get; set; } = string.Empty;

    public int CountryId { get; set; }

    public int StateId { get; set; }

    public int CityId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
