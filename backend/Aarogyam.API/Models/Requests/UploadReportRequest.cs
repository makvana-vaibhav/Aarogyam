using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Aarogyam.API.Models.Requests;

public class UploadReportRequest
{
    [Required(ErrorMessage = "Please enter a title for the report.")]
    [MaxLength(200, ErrorMessage = "Title must be 200 characters or fewer.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please select a report type.")]
    [MaxLength(50, ErrorMessage = "Report type must be 50 characters or fewer.")]
    public string ReportType { get; set; } = string.Empty;

    public DateTime? ReportDate { get; set; }

    public int? VisitId { get; set; }

    [Required(ErrorMessage = "Please choose a file to upload.")]
    public IFormFile File { get; set; } = null!;
}
