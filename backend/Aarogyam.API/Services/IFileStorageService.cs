namespace Aarogyam.API.Services;

public interface IFileStorageService
{
    Task<string> SaveAsync(string subFolder, string fileName, Stream content);

    Task<(Stream Content, string ContentType, string FileName)?> ReadAsync(string relativePath);

    void Delete(string relativePath);

    string ResolvePath(string relativePath);
}
