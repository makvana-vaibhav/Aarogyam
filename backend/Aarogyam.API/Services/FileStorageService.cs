using Aarogyam.API.Configuration;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;

namespace Aarogyam.API.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _basePath;
    private readonly FileExtensionContentTypeProvider _contentTypeProvider = new();

    public FileStorageService(IWebHostEnvironment environment, IOptions<StorageSettings> options)
    {
        _basePath = Path.IsPathRooted(options.Value.BasePath)
            ? options.Value.BasePath
            : Path.Combine(environment.ContentRootPath, options.Value.BasePath);
    }

    public async Task<string> SaveAsync(string subFolder, string fileName, Stream content)
    {
        var folder = Path.Combine(_basePath, subFolder);
        Directory.CreateDirectory(folder);

        var fullPath = Path.Combine(folder, fileName);
        await using (var fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
        {
            await content.CopyToAsync(fileStream);
        }

        return Path.Combine(subFolder, fileName).Replace('\\', '/');
    }

    public Task<(Stream Content, string ContentType, string FileName)?> ReadAsync(string relativePath)
    {
        var fullPath = ResolvePath(relativePath);
        if (!File.Exists(fullPath))
        {
            return Task.FromResult<(Stream, string, string)?>(null);
        }

        if (!_contentTypeProvider.TryGetContentType(fullPath, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        return Task.FromResult<(Stream, string, string)?>((stream, contentType, Path.GetFileName(fullPath)));
    }

    public void Delete(string relativePath)
    {
        var fullPath = ResolvePath(relativePath);
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }

    public string ResolvePath(string relativePath)
    {
        return Path.Combine(_basePath, relativePath.Replace('/', Path.DirectorySeparatorChar));
    }
}
