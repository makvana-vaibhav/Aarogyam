using System.Globalization;
using Aarogyam.API.Models.Responses;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Aarogyam.API.Services;

public class PdfService : IPdfService
{
    public byte[] GeneratePrescriptionPdf(PrescriptionDetailsRow details)
    {
        var patientTitleName = CultureInfo.CurrentCulture.TextInfo.ToTitleCase((details.PatientName ?? "").Trim().ToLowerInvariant());
        var rawDocName = (details.DoctorName ?? "").Trim();
        if (rawDocName.StartsWith("Dr.", StringComparison.OrdinalIgnoreCase))
            rawDocName = rawDocName.Substring(3).Trim();
        var doctorTitleName = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(rawDocName.ToLowerInvariant());

        int age = 0;
        if (details.PatientDateOfBirth.HasValue && details.PatientDateOfBirth.Value != default)
        {
            var today = DateTime.Today;
            age = today.Year - details.PatientDateOfBirth.Value.Year;
            if (details.PatientDateOfBirth.Value.Date > today.AddYears(-age)) age--;
        }

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(36);
                page.DefaultTextStyle(style => style.FontSize(10).FontFamily(Fonts.Arial).FontColor("#1c2e24"));

                // Header
                page.Header().Column(column =>
                {
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("Aarogyam").FontSize(22).Bold().FontColor("#0b392b");
                            col.Item().Text("DIGITAL HEALTH IDENTITY · MEDICAL PRESCRIPTION").FontSize(8.5f).Bold().FontColor("#2d6a4f").LetterSpacing(0.05f);
                        });

                        row.ConstantItem(200).AlignRight().Column(col =>
                        {
                            col.Item().Text($"Prescription #{details.PrescriptionId}").FontSize(10.5f).Bold().FontColor("#0b392b");
                            col.Item().Text($"Date: {details.PrescriptionDate:dd MMM yyyy}").FontSize(9.5f).Bold();
                            col.Item().Text($"Visit Ref: #{details.VisitId}").FontSize(8.5f).FontColor(Colors.Grey.Darken1);
                        });
                    });

                    column.Item().PaddingTop(8).LineHorizontal(1.5f).LineColor("#0b392b");
                });

                // Content
                page.Content().PaddingTop(12).Column(column =>
                {
                    column.Spacing(12);

                    // 1. Doctor & Hospital Card
                    column.Item().Border(1).BorderColor("#e5e7eb").Background("#f9fafb").Padding(12).Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Spacing(2);
                            col.Item().Text("ATTENDING DOCTOR").FontSize(8).Bold().FontColor("#4b5563").LetterSpacing(0.05f);
                            col.Item().Text($"Dr. {doctorTitleName}").Bold().FontSize(13).FontColor("#0b392b");
                            
                            var credentials = string.Join(" · ", new[] { details.DoctorDegree, details.DoctorSpecialization }.Where(s => !string.IsNullOrWhiteSpace(s)));
                            if (!string.IsNullOrWhiteSpace(credentials))
                            {
                                col.Item().Text(credentials).FontSize(9.5f).Bold().FontColor("#2d6a4f");
                            }

                            if (!string.IsNullOrWhiteSpace(details.DoctorLicenseNumber))
                            {
                                col.Item().Text($"Medical Reg. / License No: {details.DoctorLicenseNumber}").FontSize(8.5f).FontColor(Colors.Grey.Darken2);
                            }
                        });

                        var hospitalText = string.Join(", ", new[] { details.HospitalName, details.HospitalCity }.Where(s => !string.IsNullOrWhiteSpace(s)));
                        if (!string.IsNullOrWhiteSpace(hospitalText))
                        {
                            row.ConstantItem(180).AlignRight().Column(col =>
                            {
                                col.Spacing(2);
                                col.Item().Text("HEALTHCARE FACILITY").FontSize(8).Bold().FontColor("#4b5563").LetterSpacing(0.05f);
                                col.Item().Text(details.HospitalName ?? "").Bold().FontSize(10.5f).FontColor("#0b392b");
                                if (!string.IsNullOrWhiteSpace(details.HospitalAddress))
                                    col.Item().Text(details.HospitalAddress).FontSize(8.5f).FontColor(Colors.Grey.Darken2);
                                if (!string.IsNullOrWhiteSpace(details.HospitalCity))
                                    col.Item().Text(details.HospitalCity).FontSize(8.5f).FontColor(Colors.Grey.Darken2);
                            });
                        }
                    });

                    // 2. Patient Demographics Card
                    column.Item().Border(1).BorderColor("#e5e7eb").Background("#ffffff").Padding(10).Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Spacing(2);
                            col.Item().Text("PATIENT NAME").FontSize(8).Bold().FontColor("#4b5563").LetterSpacing(0.05f);
                            col.Item().Text(patientTitleName).Bold().FontSize(12).FontColor("#0b392b");
                            if (!string.IsNullOrWhiteSpace(details.PatientAarogyamId))
                            {
                                col.Item().Text($"Aarogyam ID: {details.PatientAarogyamId}").Bold().FontSize(9.5f).FontColor("#2d6a4f");
                            }
                        });

                        row.ConstantItem(180).AlignRight().Column(col =>
                        {
                            col.Spacing(2);
                            var ageGender = $"{(age > 0 ? $"{age} yrs" : "—")} / {(string.IsNullOrWhiteSpace(details.PatientGender) ? "—" : details.PatientGender)}";
                            col.Item().Text("AGE / GENDER").FontSize(8).Bold().FontColor("#4b5563").LetterSpacing(0.05f);
                            col.Item().Text(ageGender).Bold().FontSize(10.5f).FontColor("#1c2e24");
                            col.Item().Text($"Blood Group: {(string.IsNullOrWhiteSpace(details.PatientBloodGroup) ? "Not set" : details.PatientBloodGroup)}").FontSize(9).FontColor(Colors.Grey.Darken2);
                        });
                    });

                    // 3. Clinical Diagnosis Banner
                    if (!string.IsNullOrWhiteSpace(details.DiagnosisTitle))
                    {
                        column.Item().Border(1).BorderColor("#d1fae5").Background("#ecfdf5").Padding(9).Row(row =>
                        {
                            row.ConstantItem(110).Text("CLINICAL DIAGNOSIS:").Bold().FontSize(9).FontColor("#065f46");
                            row.RelativeItem().Text(details.DiagnosisTitle).Bold().FontSize(11).FontColor("#065f46");
                        });
                    }

                    // 4. Rx Medications Section
                    column.Item().PaddingTop(4).Column(col =>
                    {
                        col.Spacing(6);
                        col.Item().Text("Prescribed Medications & Dosage Instructions").Bold().FontSize(12).FontColor("#0b392b");

                        col.Item().Border(1).BorderColor("#e5e7eb").Background("#fafafa").Padding(12).Text(details.PrescriptionText ?? "").FontSize(10.5f).LineHeight(1.5f);
                    });

                    // 5. Patient Guidance Notes
                    column.Item().PaddingTop(6).Background("#fdfbf7").Border(1).BorderColor("#f3ebd8").Padding(10).Column(col =>
                    {
                        col.Spacing(2);
                        col.Item().Text("IMPORTANT INSTRUCTIONS FOR PATIENT:").FontSize(8).Bold().FontColor("#92400e");
                        col.Item().Text("• Follow the exact dosage timings and instructions specified by your doctor.").FontSize(8.5f).FontColor("#78350f");
                        col.Item().Text("• Complete the prescribed duration. Do not stop or change medications without consulting your doctor.").FontSize(8.5f).FontColor("#78350f");
                        col.Item().Text("• Store medications in a cool, dry place away from direct sunlight.").FontSize(8.5f).FontColor("#78350f");
                    });

                    // 6. Signature & Digital Authorization Box
                    column.Item().PaddingTop(16).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Spacing(2);
                            c.Item().Text("E-Prescription Verification").FontSize(8.5f).Bold().FontColor("#0b392b");
                            c.Item().Text("Generated securely via Aarogyam Electronic Health Record System.").FontSize(8).FontColor(Colors.Grey.Darken1);
                            c.Item().Text($"Timestamp: {DateTime.UtcNow:dd MMM yyyy HH:mm} UTC").FontSize(7.5f).FontColor(Colors.Grey.Medium);
                        });

                        row.ConstantItem(180).AlignRight().Column(c =>
                        {
                            c.Item().PaddingBottom(24).Text("");
                            c.Item().LineHorizontal(1).LineColor("#0b392b");
                            c.Item().PaddingTop(4).Text($"Dr. {doctorTitleName}").Bold().FontSize(10).FontColor("#0b392b");
                            c.Item().Text("Authorized Medical Practitioner").FontSize(8).FontColor(Colors.Grey.Darken1);
                        });
                    });
                });

                // Footer
                page.Footer().Column(col =>
                {
                    col.Item().LineHorizontal(0.5f).LineColor("#e5e7eb");
                    col.Item().PaddingTop(6).Row(row =>
                    {
                        row.RelativeItem().Text("Aarogyam · Digital Health Identity · Confidential Medical Prescription").FontSize(8).FontColor(Colors.Grey.Darken1);
                        row.RelativeItem().AlignRight().Text(text =>
                        {
                            text.Span("Page ");
                            text.CurrentPageNumber();
                            text.Span(" of ");
                            text.TotalPages();
                        });
                    });
                });
            });
        });

        return document.GeneratePdf();
    }

    public byte[] GeneratePrescriptionPdf(
        string patientName,
        string doctorName,
        string diagnosisTitle,
        DateTime prescriptionDate,
        string prescriptionText)
    {
        var dummy = new PrescriptionDetailsRow
        {
            PatientName = patientName,
            DoctorName = doctorName,
            DiagnosisTitle = diagnosisTitle,
            PrescriptionDate = prescriptionDate,
            PrescriptionText = prescriptionText
        };
        return GeneratePrescriptionPdf(dummy);
    }

    public byte[] GeneratePatientProfilePdf(
        PatientMasterRow patient,
        List<VisitRow>? visits = null,
        List<DiagnosisRow>? diagnoses = null,
        List<PrescriptionRow>? prescriptions = null,
        List<MedicalReportRow>? reports = null)
    {
        var rawName = string.Join(" ", new[] { patient.FirstName, patient.MiddleName, patient.LastName }.Where(part => !string.IsNullOrWhiteSpace(part)));
        var fullName = CultureInfo.CurrentCulture.TextInfo.ToTitleCase(rawName.Trim().ToLowerInvariant());

        int age = 0;
        if (patient.DateOfBirth != default)
        {
            var today = DateTime.Today;
            age = today.Year - patient.DateOfBirth.Year;
            if (patient.DateOfBirth.Date > today.AddYears(-age)) age--;
        }

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(36);
                page.DefaultTextStyle(style => style.FontSize(10).FontFamily(Fonts.Arial).FontColor("#1c2e24"));

                // Header
                page.Header().Column(column =>
                {
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("Aarogyam").FontSize(22).Bold().FontColor("#0b392b");
                            col.Item().Text("COMPREHENSIVE PATIENT MEDICAL HEALTH RECORD").FontSize(8.5f).Bold().FontColor("#2d6a4f").LetterSpacing(0.05f);
                        });

                        row.ConstantItem(180).AlignRight().Column(col =>
                        {
                            col.Item().Text($"Generated: {DateTime.UtcNow:dd MMM yyyy}").FontSize(9.5f).Bold();
                            col.Item().Text("Authentic Digital Health Record").FontSize(8.5f).FontColor(Colors.Grey.Darken1);
                        });
                    });

                    column.Item().PaddingTop(8).LineHorizontal(1.5f).LineColor("#0b392b");
                });

                // Content
                page.Content().PaddingTop(14).Column(column =>
                {
                    column.Spacing(14);

                    // Patient Vitals & Demographics Card
                    column.Item().Border(1).BorderColor("#e5e7eb").Background("#f9fafb").Padding(12).Column(col =>
                    {
                        col.Spacing(8);

                        col.Item().Row(r =>
                        {
                            r.RelativeItem().Column(c =>
                            {
                                c.Item().Text(fullName).Bold().FontSize(15).FontColor("#0b392b");
                                c.Item().Text($"Aarogyam ID: {patient.AarogyamId}").Bold().FontSize(11).FontColor("#2d6a4f");
                            });

                            r.ConstantItem(160).AlignRight().Column(c =>
                            {
                                c.Item().Text($"Blood Group: {(string.IsNullOrWhiteSpace(patient.BloodGroup) ? "Not specified" : patient.BloodGroup)}").Bold().FontSize(11);
                                c.Item().Text($"Age / Gender: {(age > 0 ? $"{age} yrs" : "—")} / {patient.Gender}").FontSize(10).FontColor("#374151");
                            });
                        });

                        col.Item().LineHorizontal(0.5f).LineColor("#e5e7eb");

                        col.Item().Row(r =>
                        {
                            r.RelativeItem().Column(c =>
                            {
                                c.Item().Text($"Date of Birth: {patient.DateOfBirth:dd MMM yyyy}").FontSize(9.5f);
                                c.Item().Text($"Emergency Contact: {(string.IsNullOrWhiteSpace(patient.EmergencyContact) ? "Not provided" : patient.EmergencyContact)}").FontSize(9.5f);
                            });

                            r.RelativeItem().Column(c =>
                            {
                                c.Item().Text($"Address: {patient.Address}").FontSize(9.5f);
                                c.Item().Text($"Registered Member Since: {patient.CreatedAt:dd MMM yyyy}").FontSize(9.5f).FontColor(Colors.Grey.Darken1);
                            });
                        });
                    });

                    // 1. Clinical Visits & Consultations Section
                    column.Item().Column(sec =>
                    {
                        sec.Spacing(6);
                        sec.Item().Row(r =>
                        {
                            r.RelativeItem().Text("1. Clinical Visits & Consultation History").Bold().FontSize(12).FontColor("#0b392b");
                            r.ConstantItem(100).AlignRight().Text($"Total: {(visits?.Count ?? 0)} visits").FontSize(9).FontColor(Colors.Grey.Darken1);
                        });

                        if (visits != null && visits.Count > 0)
                        {
                            sec.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(70);
                                    columns.ConstantColumn(80);
                                    columns.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Background("#0b392b").Padding(6).Text("Date").Bold().FontSize(9).FontColor(Colors.White);
                                    header.Cell().Background("#0b392b").Padding(6).Text("Visit Ref").Bold().FontSize(9).FontColor(Colors.White);
                                    header.Cell().Background("#0b392b").Padding(6).Text("Consultation Summary & Notes").Bold().FontSize(9).FontColor(Colors.White);
                                });

                                foreach (var visit in visits.OrderByDescending(v => v.VisitDate).ThenByDescending(v => v.VisitId))
                                {
                                    var visitNotes = string.IsNullOrWhiteSpace(visit.Notes) ? "Routine clinical consultation" : visit.Notes;

                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text($"{visit.VisitDate:dd MMM yyyy}").FontSize(9);
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text($"Visit #{visit.VisitId}").FontSize(9).Bold();
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text(visitNotes).FontSize(9);
                                }
                            });
                        }
                        else
                        {
                            sec.Item().Border(1).BorderColor("#e5e7eb").Padding(8).Text("No consultation visits recorded yet.").FontSize(9.5f).FontColor(Colors.Grey.Darken1);
                        }
                    });

                    // 2. Diagnoses & Medical Conditions Section
                    column.Item().Column(sec =>
                    {
                        sec.Spacing(6);
                        sec.Item().Row(r =>
                        {
                            r.RelativeItem().Text("2. Recorded Diagnoses & Medical Conditions").Bold().FontSize(12).FontColor("#0b392b");
                            r.ConstantItem(100).AlignRight().Text($"Total: {(diagnoses?.Count ?? 0)} records").FontSize(9).FontColor(Colors.Grey.Darken1);
                        });

                        if (diagnoses != null && diagnoses.Count > 0)
                        {
                            sec.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(80);
                                    columns.ConstantColumn(140);
                                    columns.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Background("#0b392b").Padding(6).Text("Date").Bold().FontSize(9).FontColor(Colors.White);
                                    header.Cell().Background("#0b392b").Padding(6).Text("Diagnosis Title").Bold().FontSize(9).FontColor(Colors.White);
                                    header.Cell().Background("#0b392b").Padding(6).Text("Clinical Description & Findings").Bold().FontSize(9).FontColor(Colors.White);
                                });

                                foreach (var diag in diagnoses)
                                {
                                    var desc = string.IsNullOrWhiteSpace(diag.Description) ? "—" : diag.Description;

                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text($"{diag.DiagnosisDate:dd MMM yyyy}").FontSize(9);
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text(diag.DiagnosisTitle).FontSize(9).Bold();
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text(desc).FontSize(9);
                                }
                            });
                        }
                        else
                        {
                            sec.Item().Border(1).BorderColor("#e5e7eb").Padding(8).Text("No diagnoses recorded yet.").FontSize(9.5f).FontColor(Colors.Grey.Darken1);
                        }
                    });

                    // 3. Prescriptions & Medication Log
                    column.Item().Column(sec =>
                    {
                        sec.Spacing(6);
                        sec.Item().Row(r =>
                        {
                            r.RelativeItem().Text("3. Prescriptions & Medication History").Bold().FontSize(12).FontColor("#0b392b");
                            r.ConstantItem(100).AlignRight().Text($"Total: {(prescriptions?.Count ?? 0)} records").FontSize(9).FontColor(Colors.Grey.Darken1);
                        });

                        if (prescriptions != null && prescriptions.Count > 0)
                        {
                            sec.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(80);
                                    columns.ConstantColumn(90);
                                    columns.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Background("#0b392b").Padding(6).Text("Date").Bold().FontSize(9).FontColor(Colors.White);
                                    header.Cell().Background("#0b392b").Padding(6).Text("Prescription #").Bold().FontSize(9).FontColor(Colors.White);
                                    header.Cell().Background("#0b392b").Padding(6).Text("Medications & Instructions").Bold().FontSize(9).FontColor(Colors.White);
                                });

                                foreach (var pres in prescriptions.OrderByDescending(p => p.PrescriptionDate))
                                {
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text($"{pres.PrescriptionDate:dd MMM yyyy}").FontSize(9);
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text($"Rx #{pres.PrescriptionId}").FontSize(9).Bold();
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text(pres.PrescriptionText ?? "").FontSize(9);
                                }
                            });
                        }
                        else
                        {
                            sec.Item().Border(1).BorderColor("#e5e7eb").Padding(8).Text("No prescriptions recorded yet.").FontSize(9.5f).FontColor(Colors.Grey.Darken1);
                        }
                    });

                    // 4. Diagnostic Reports Log
                    if (reports != null && reports.Count > 0)
                    {
                        column.Item().Column(sec =>
                        {
                            sec.Spacing(6);
                            sec.Item().Row(r =>
                            {
                                r.RelativeItem().Text("4. Diagnostic Reports & Lab Documents").Bold().FontSize(12).FontColor("#0b392b");
                                r.ConstantItem(100).AlignRight().Text($"Total: {reports.Count} files").FontSize(9).FontColor(Colors.Grey.Darken1);
                            });

                            sec.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(80);
                                    columns.ConstantColumn(130);
                                    columns.RelativeColumn();
                                    columns.ConstantColumn(80);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Background("#0b392b").Padding(6).Text("Date").Bold().FontSize(9).FontColor(Colors.White);
                                    header.Cell().Background("#0b392b").Padding(6).Text("Report Type").Bold().FontSize(9).FontColor(Colors.White);
                                    header.Cell().Background("#0b392b").Padding(6).Text("Document Title").Bold().FontSize(9).FontColor(Colors.White);
                                    header.Cell().Background("#0b392b").Padding(6).Text("Source").Bold().FontSize(9).FontColor(Colors.White);
                                });

                                foreach (var rep in reports.OrderByDescending(r => r.ReportDate ?? r.CreatedAt))
                                {
                                    var rDate = rep.ReportDate ?? rep.CreatedAt;
                                    var src = rep.DoctorId.HasValue ? "Doctor" : "Patient Upload";
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text($"{rDate:dd MMM yyyy}").FontSize(9);
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text(rep.ReportType ?? "General").FontSize(9).Bold();
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text(rep.Title ?? "").FontSize(9);
                                    table.Cell().BorderBottom(0.5f).BorderColor("#e5e7eb").Padding(6).Text(src).FontSize(9);
                                }
                            });
                        });
                    }

                    // Disclaimer notice
                    column.Item().PaddingTop(6).Background("#f3f4f6").Padding(8).Row(row =>
                    {
                        row.RelativeItem().Text("CONFIDENTIAL MEDICAL RECORD: This electronic document is generated from the Aarogyam Digital Health Platform for patient healthcare records. All information is protected and confidential.").FontSize(7.5f).FontColor("#4b5563");
                    });
                });

                // Footer
                page.Footer().Column(col =>
                {
                    col.Item().LineHorizontal(0.5f).LineColor("#e5e7eb");
                    col.Item().PaddingTop(6).Row(row =>
                    {
                        row.RelativeItem().Text("Aarogyam · Digital Health Identity · Confidential Medical Record").FontSize(8).FontColor(Colors.Grey.Darken1);
                        row.RelativeItem().AlignRight().Text(text =>
                        {
                            text.Span("Page ");
                            text.CurrentPageNumber();
                            text.Span(" of ");
                            text.TotalPages();
                        });
                    });
                });
            });
        });

        return document.GeneratePdf();
    }
}
