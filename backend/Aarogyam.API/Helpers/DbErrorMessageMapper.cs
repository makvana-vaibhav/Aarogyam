using System;
using System.Linq;

namespace Aarogyam.API.Helpers;

/// <summary>
/// Turns raw SQL Server error text into friendly, user-facing messages.
///
/// Used in two places:
///  1. ErrorHandlingMiddleware - for genuinely thrown SqlException / DbUpdateException.
///  2. Controllers - for the many stored procedures (the "*Manage" ones) that swallow SQL
///     errors themselves via `BEGIN CATCH SELECT 0 AS Success, ERROR_MESSAGE() AS Message END CATCH`
///     and return them as a normal {Success, Message} result row instead of throwing.
///
/// Because callers in scenario (2) also pass through plenty of hand-written procedure
/// messages that are NOT SQL errors (e.g. "Deleted.", "Invalid action.",
/// "This mobile number is already OTP-verified."), the fallback branch only rewrites the
/// message when it actually looks like raw SQL/DB error text. Anything else is returned
/// unchanged so legitimate hand-written messages are never stomped on.
/// </summary>
public static class DbErrorMessageMapper
{
    // Phrases typical of raw SQL Server error text (ERROR_MESSAGE() output, exception messages, etc.)
    // that are NOT already handled by one of the specific cases above. Used only to decide whether
    // the generic fallback message should replace an otherwise-unmatched message.
    private static readonly string[] SqlErrorIndicators =
    {
        "constraint",
        "conflicted",
        "cannot insert",
        "violation of",
        "cannot be null",
        "syntax error",
        "invalid column",
        "invalid object name",
        "arithmetic overflow",
        "string or binary data would be truncated",
        "was deadlocked",
        "permission was denied",
        "cannot open database",
        "login failed",
        "conversion failed",
        "sqlexception"
    };

    public static string Friendly(string? message)
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

        // Delete-side violation: a row can't be deleted because other rows still reference it.
        // This is different SQL Server wording from "FOREIGN KEY constraint" (insert/update-side),
        // so it gets its own case rather than being merged with it.
        if (message.Contains("REFERENCE constraint", StringComparison.OrdinalIgnoreCase))
            return "This record can't be deleted because related data (e.g. visits, prescriptions, reports) still references it. Remove or reassign that data first.";

        if (message.Contains("FOREIGN KEY constraint", StringComparison.OrdinalIgnoreCase))
            return "The selected record or location reference is invalid. Please refresh and try again.";

        if (message.Contains("Timeout", StringComparison.OrdinalIgnoreCase) ||
            message.Contains("connection", StringComparison.OrdinalIgnoreCase))
            return "Service is temporarily busy. Please try again in a few moments.";

        // Fallback: only replace the message with the generic text when it actually looks like
        // raw SQL/DB error text. Hand-written stored-procedure messages (validation errors,
        // "Deleted.", etc.) don't match any of the indicators above and are returned unchanged.
        if (LooksLikeSqlError(message))
            return "Unable to complete the request. Please check your inputs and try again.";

        return message;
    }

    private static bool LooksLikeSqlError(string message)
    {
        return SqlErrorIndicators.Any(indicator => message.Contains(indicator, StringComparison.OrdinalIgnoreCase));
    }
}
