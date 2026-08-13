namespace Aarogyam.API.Models.Responses;

public class PrescriptionDetailsRow
{
    public int PrescriptionId { get; set; }

    public int VisitId { get; set; }

    public int? DiagnosisId { get; set; }

    public string PrescriptionText { get; set; } = string.Empty;

    public string? PdfPath { get; set; }

    public DateTime PrescriptionDate { get; set; }

    public int PatientId { get; set; }

    public string? PatientAarogyamId { get; set; }

    public string PatientName { get; set; } = string.Empty;

    public DateTime? PatientDateOfBirth { get; set; }

    public string? PatientGender { get; set; }

    public string? PatientBloodGroup { get; set; }

    public int DoctorId { get; set; }

    public string DoctorName { get; set; } = string.Empty;

    public string? DoctorLicenseNumber { get; set; }

    public string? HospitalName { get; set; }

    public string? HospitalAddress { get; set; }

    public string? HospitalCity { get; set; }

    public string? DoctorDegree { get; set; }

    public string? DoctorSpecialization { get; set; }

    public string DiagnosisTitle { get; set; } = string.Empty;
}
