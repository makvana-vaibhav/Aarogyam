namespace Aarogyam.API.Services;

public interface IPdfService
{
    byte[] GeneratePrescriptionPdf(
        string patientName,
        string doctorName,
        string diagnosisTitle,
        DateTime prescriptionDate,
        string prescriptionText);
}
