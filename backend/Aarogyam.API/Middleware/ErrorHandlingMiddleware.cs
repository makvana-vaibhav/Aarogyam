using System.Net;
using System.Text.Json;
using Aarogyam.API.Helpers;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Aarogyam.API.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate _next, ILogger<ErrorHandlingMiddleware> logger)
    {
        this._next = _next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred while processing request {Path}", context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        string userFriendlyMessage = "An unexpected error occurred. Please try again.";

        if (exception is DbUpdateException dbEx)
        {
            var inner = dbEx.InnerException?.Message ?? dbEx.Message;
            userFriendlyMessage = DbErrorMessageMapper.Friendly(inner);
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        }
        else if (exception is SqlException sqlEx)
        {
            userFriendlyMessage = DbErrorMessageMapper.Friendly(sqlEx.Message);
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        }
        else if (exception is ArgumentException argEx)
        {
            userFriendlyMessage = argEx.Message;
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        }
        else if (exception is InvalidOperationException invEx)
        {
            userFriendlyMessage = invEx.Message.Contains("sequence contains no elements", StringComparison.OrdinalIgnoreCase)
                ? "The requested item was not found."
                : "Unable to complete the requested operation. Please verify your details.";
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        }
        else if (exception is Microsoft.AspNetCore.Http.BadHttpRequestException badRequestEx)
        {
            // Thrown by Kestrel while reading the request body/multipart form (e.g. a file
            // upload past [RequestSizeLimit]) - happens during model binding, before the
            // action runs, so it never reaches the per-endpoint size checks.
            context.Response.StatusCode = badRequestEx.StatusCode;
            userFriendlyMessage = badRequestEx.StatusCode == (int)HttpStatusCode.RequestEntityTooLarge
                ? "The uploaded file is too large. Please upload a file under 20 MB."
                : "The request could not be processed. Please check your input and try again.";
        }

        var responseObj = new
        {
            success = 0,
            message = userFriendlyMessage
        };

        var json = JsonSerializer.Serialize(responseObj);
        await context.Response.WriteAsync(json);
    }
}
