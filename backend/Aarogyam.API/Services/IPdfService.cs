using Aarogyam.API.Models.Responses;

namespace Aarogyam.API.Services;

public interface IPdfService
{
    byte[] GeneratePrescriptionPdf(
        string patientName,
        string doctorName,
        string diagnosisTitle,
        DateTime prescriptionDate,
        string prescriptionText);

    byte[] GeneratePatientProfilePdf(
        PatientMasterRow patient,
        List<VisitRow>? visits = null,
        List<DiagnosisRow>? diagnoses = null,
        List<PrescriptionRow>? prescriptions = null,
        List<MedicalReportRow>? reports = null);
}
