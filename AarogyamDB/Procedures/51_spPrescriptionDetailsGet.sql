-- One-shot lookup for PDF generation: the prescription plus the patient name,
-- doctor name and diagnosis title needed for the document header, in a single
-- query instead of four separate round trips (visit, patient, doctor, diagnosis).
CREATE OR ALTER PROCEDURE dbo.spPrescriptionDetailsGet
    @PrescriptionId INT
AS
BEGIN
    SELECT
        pr.PrescriptionId,
        pr.VisitId,
        pr.DiagnosisId,
        pr.PrescriptionText,
        pr.PdfPath,
        pr.PrescriptionDate,
        v.PatientId,
        p.FirstName + ' ' + p.LastName AS PatientName,
        'Dr. ' + d.FirstName + ' ' + d.LastName AS DoctorName,
        ISNULL(dg.DiagnosisTitle, 'General consultation') AS DiagnosisTitle
    FROM dbo.Prescriptions pr
    JOIN dbo.Visits v ON v.VisitId = pr.VisitId
    JOIN dbo.Patients p ON p.PatientId = v.PatientId
    JOIN dbo.Doctors d ON d.DoctorId = v.DoctorId
    LEFT JOIN dbo.Diagnoses dg ON dg.DiagnosisId = pr.DiagnosisId
    WHERE pr.PrescriptionId = @PrescriptionId;
END
