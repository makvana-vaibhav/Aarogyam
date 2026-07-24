using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Aarogyam.API.Models.Requests;

public class UploadReportRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string ReportType { get; set; } = string.Empty;

    public DateTime? ReportDate { get; set; }

    public int? VisitId { get; set; }

    [Required]
    public IFormFile File { get; set; } = null!;
}
