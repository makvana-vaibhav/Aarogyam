using System.Diagnostics;
using System.Security.Cryptography;
using Aarogyam.API.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Aarogyam.API.Controllers;

// TEST/STRESS ENDPOINT ONLY.
// NEVER ENABLE OR DEPLOY THIS ENDPOINT IN PRODUCTION.
[ApiController]
[Route("api/test/stress")]
public class StressTestController : ControllerBase
{
    private const int BytesPerMegabyte = 1024 * 1024;
    private const int ChunkSize = BytesPerMegabyte;
    private readonly StressTestSettings _settings;
    private readonly ILogger<StressTestController> _logger;

    public StressTestController(IOptions<StressTestSettings> options, ILogger<StressTestController> logger)
    {
        _settings = options.Value;
        _logger = logger;
    }

    [HttpGet("generate-report")]
    public async Task<IActionResult> GenerateReport([FromQuery] int sizeMb = 50)
    {
        if (!_settings.Enabled)
        {
            return NotFound();
        }

        if (sizeMb <= 0 || sizeMb > _settings.MaxSizeMb)
        {
            return BadRequest(new
            {
                success = 0,
                message = $"sizeMb must be between 1 and {_settings.MaxSizeMb}."
            });
        }

        var requestedBytes = checked((long)sizeMb * BytesPerMegabyte);
        var fileName = $"stress-report-{Guid.NewGuid():N}.bin";
        var filePath = Path.Combine(Path.GetTempPath(), fileName);
        var requestStopwatch = Stopwatch.StartNew();
        var generationStopwatch = Stopwatch.StartNew();
        var generatedBytes = 0L;
        var fileCreated = false;
        var responseFileScheduled = false;

        try
        {
            await using (var output = new FileStream(
                filePath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.Read,
                ChunkSize,
                FileOptions.Asynchronous | FileOptions.SequentialScan))
            {
                fileCreated = true;
                var buffer = GC.AllocateUninitializedArray<byte>(ChunkSize);

                while (generatedBytes < requestedBytes)
                {
                    var bytesToWrite = (int)Math.Min(buffer.Length, requestedBytes - generatedBytes);
                    RandomNumberGenerator.Fill(buffer.AsSpan(0, bytesToWrite));

                    // Hashing each chunk adds bounded CPU work without retaining the file in memory.
                    _ = SHA256.HashData(buffer.AsSpan(0, bytesToWrite));

                    await output.WriteAsync(buffer.AsMemory(0, bytesToWrite), HttpContext.RequestAborted);
                    generatedBytes += bytesToWrite;
                }

                await output.FlushAsync(HttpContext.RequestAborted);
            }

            generationStopwatch.Stop();
            var generationDurationMs = generationStopwatch.ElapsedMilliseconds;
            var requestDurationMs = requestStopwatch.ElapsedMilliseconds;
            _logger.LogInformation(
                "Stress report generated successfully. RequestedSizeMb={RequestedSizeMb} GeneratedBytes={GeneratedBytes} GenerationDurationMs={GenerationDurationMs} RequestDurationMs={RequestDurationMs} TemporaryFile={TemporaryFile}",
                sizeMb,
                generatedBytes,
                generationDurationMs,
                requestDurationMs,
                fileName);

            HttpContext.Response.OnCompleted(() => DeleteTemporaryFileAsync(filePath, fileName));
            responseFileScheduled = true;
            return PhysicalFile(filePath, "application/octet-stream", fileName, enableRangeProcessing: false);
        }
        catch (Exception exception)
        {
            generationStopwatch.Stop();
            requestStopwatch.Stop();
            _logger.LogError(
                exception,
                "Stress report generation failed. RequestedSizeMb={RequestedSizeMb} GeneratedBytes={GeneratedBytes} GenerationDurationMs={GenerationDurationMs} RequestDurationMs={RequestDurationMs} TemporaryFile={TemporaryFile}",
                sizeMb,
                generatedBytes,
                generationStopwatch.ElapsedMilliseconds,
                requestStopwatch.ElapsedMilliseconds,
                fileName);
            throw;
        }
        finally
        {
            if (fileCreated && !responseFileScheduled)
            {
                await DeleteTemporaryFileAsync(filePath, fileName);
            }
        }
    }

    private async Task DeleteTemporaryFileAsync(string filePath, string fileName)
    {
        try
        {
            System.IO.File.Delete(filePath);
            _logger.LogInformation("Stress report temporary file deleted. TemporaryFile={TemporaryFile}", fileName);
        }
        catch (Exception exception)
        {
            _logger.LogWarning(exception, "Unable to delete stress report temporary file. TemporaryFile={TemporaryFile}", fileName);
        }

        await Task.CompletedTask;
    }
}
