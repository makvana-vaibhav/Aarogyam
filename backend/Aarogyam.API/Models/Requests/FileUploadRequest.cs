using Microsoft.AspNetCore.Http;

namespace Aarogyam.API.Models.Requests;

public class FileUploadRequest
{
    public IFormFile File { get; set; } = null!;
}
