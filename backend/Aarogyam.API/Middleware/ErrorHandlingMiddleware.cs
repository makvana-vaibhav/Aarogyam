using System.Net;
using System.Text.Json;
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
            userFriendlyMessage = MapDbErrorMessage(inner);
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        }
        else if (exception is SqlException sqlEx)
        {
            userFriendlyMessage = MapDbErrorMessage(sqlEx.Message);
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

        var responseObj = new
        {
            success = 0,
            message = userFriendlyMessage
        };

        var json = JsonSerializer.Serialize(responseObj);
        await context.Response.WriteAsync(json);
    }

    private static string MapDbErrorMessage(string message)
    {
        if (string.IsNullOrEmpty(message))
            return "A database error occurred. Please try again.";

        if (message.Contains("UNIQUE KEY constraint", StringComparison.OrdinalIgnoreCase) ||
            message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase))
        {
            if (message.Contains("Phone", StringComparison.OrdinalIgnoreCase) || message.Contains("PhoneNumber", StringComparison.OrdinalIgnoreCase))
                return "This mobile number is already registered. Please log in or use another mobile number.";
            if (message.Contains("Email", StringComparison.OrdinalIgnoreCase))
                return "This email address is already registered. Please log in or use another email.";
            if (message.Contains("License", StringComparison.OrdinalIgnoreCase) || message.Contains("LicenseNumber", StringComparison.OrdinalIgnoreCase))
                return "A doctor profile with this medical licence number is already registered.";
            if (message.Contains("AarogyamId", StringComparison.OrdinalIgnoreCase))
                return "An account with this Aarogyam ID already exists.";
            return "An account with these details already exists. Please log in.";
        }

        if (message.Contains("FOREIGN KEY constraint", StringComparison.OrdinalIgnoreCase))
            return "The selected record or location reference is invalid. Please refresh and try again.";

        if (message.Contains("Timeout", StringComparison.OrdinalIgnoreCase) ||
            message.Contains("connection", StringComparison.OrdinalIgnoreCase))
            return "Service is temporarily busy. Please try again in a few moments.";

        return "Unable to complete the request. Please check your inputs and try again.";
    }
}
