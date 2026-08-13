CREATE OR ALTER PROCEDURE dbo.spPrescriptionDetailsGet
    @PrescriptionId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        pr.PrescriptionId,
        pr.VisitId,
        pr.DiagnosisId,
        pr.PrescriptionText,
        pr.PdfPath,
        pr.PrescriptionDate,
        v.PatientId,
        p.AarogyamId AS PatientAarogyamId,
        p.FirstName + ' ' + ISNULL(p.MiddleName + ' ', '') + p.LastName AS PatientName,
        p.DateOfBirth AS PatientDateOfBirth,
        p.Gender AS PatientGender,
        p.BloodGroup AS PatientBloodGroup,
        d.DoctorId,
        'Dr. ' + d.FirstName + ' ' + ISNULL(d.MiddleName + ' ', '') + d.LastName AS DoctorName,
        d.LicenseNumber AS DoctorLicenseNumber,
        h.HospitalName,
        h.Address AS HospitalAddress,
        c.CityName AS HospitalCity,
        deg.DegreeName AS DoctorDegree,
        spec.SpecializationName AS DoctorSpecialization,
        ISNULL(dg.DiagnosisTitle, 'Clinical Consultation') AS DiagnosisTitle
    FROM dbo.Prescriptions pr
    JOIN dbo.Visits v ON v.VisitId = pr.VisitId
    JOIN dbo.Patients p ON p.PatientId = v.PatientId
    JOIN dbo.Doctors d ON d.DoctorId = v.DoctorId
    LEFT JOIN dbo.HospitalMaster h ON h.HospitalId = d.HospitalId
    LEFT JOIN dbo.CityMaster c ON c.CityId = h.CityId
    LEFT JOIN dbo.DegreeMaster deg ON deg.DegreeId = d.DegreeId
    LEFT JOIN dbo.SpecializationMaster spec ON spec.SpecializationId = d.SpecializationId
    LEFT JOIN dbo.Diagnoses dg ON dg.DiagnosisId = pr.DiagnosisId
    WHERE pr.PrescriptionId = @PrescriptionId;
END
