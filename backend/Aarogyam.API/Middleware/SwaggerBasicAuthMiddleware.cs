using System.Text;
using Aarogyam.API.Configuration;
using Microsoft.Extensions.Options;

namespace Aarogyam.API.Middleware;

public class SwaggerBasicAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly SwaggerSettings _settings;

    public SwaggerBasicAuthMiddleware(RequestDelegate next, IOptions<SwaggerSettings> options)
    {
        _next = next;
        _settings = options.Value;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/swagger"))
        {
            await _next(context);
            return;
        }

        var authHeader = context.Request.Headers.Authorization.ToString();
        if (authHeader.StartsWith("Basic ", StringComparison.OrdinalIgnoreCase))
        {
            var encodedCredentials = authHeader["Basic ".Length..].Trim();

            string decoded;
            try
            {
                decoded = Encoding.UTF8.GetString(Convert.FromBase64String(encodedCredentials));
            }
            catch (FormatException)
            {
                decoded = string.Empty;
            }

            var separatorIndex = decoded.IndexOf(':');
            if (separatorIndex >= 0)
            {
                var username = decoded[..separatorIndex];
                var password = decoded[(separatorIndex + 1)..];

                if (username == _settings.Username && password == _settings.Password)
                {
                    await _next(context);
                    return;
                }
            }
        }

        context.Response.Headers.WWWAuthenticate = "Basic realm=\"Swagger\", charset=\"UTF-8\"";
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await context.Response.WriteAsync("Unauthorized");
    }
}
